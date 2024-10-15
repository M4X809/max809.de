import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
	getServerSession,
	type Session,
	type User,
	type DefaultSession,
	type NextAuthOptions,
	type Profile,
	type Account,
} from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import SpotifyProvider from "next-auth/providers/spotify";
import EmailProvider from "next-auth/providers/email";

import { PostHog } from "posthog-node";

import { env } from "~/env";
import { db } from "~/server/db";
import {
	accounts,
	loginWhitelist,
	sessions,
	users,
	verificationTokens,
} from "~/server/db/schema";

import { eq } from "drizzle-orm";
import { checkConf, checkWhitelist, emailHtml } from "~/lib/sUtils";
import type { Key } from "ts-key-enum";
import chalk from "chalk";
import { z } from "zod";

import { createTransport } from "nodemailer";

const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
	host: env.NEXT_PUBLIC_POSTHOG_HOST,
});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			admin?: boolean;
			staff?: boolean;
			permissions?: string[];
			config?: Config;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}
	// @ts-ignore
	interface User extends AdapterUser {
		limit?: number;
		admin?: boolean;
		staff?: boolean;
		permissions?: string[];
		email?: string;
		config?: Config;
		whiteListId?: string;
	}

	interface Config {
		userPage?: {
			expanded?: string[];
		};
		global?: {
			openCommandKey?: keyof typeof Key | keyof (typeof Key)[];
		};
	}

	type SessionType = Session | null | undefined;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		async session({ session, user }: { session: Session; user: User }) {
			const checkedConfig = checkConf(user?.config);
			if (!user.whiteListId) void checkWhitelist({ user });

			return {
				...session,
				user: {
					...session.user,
					...user,
					email: undefined,
					emailVerified: undefined,
					config: checkedConfig.data,
				},
			};
		},
		async redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
		async signIn({
			user,
			account,
			profile,
			// email,
		}: {
			user: User | AdapterUser;
			account: Account | null;
			profile?: Profile & { image_url?: string; banner_url?: string };
		}) {
			console.log(
				chalk.hex("#00eaff").bold("user", JSON.stringify(user, null, 2)),
			);
			console.log(
				chalk.hex("#ff8400").bold("account", JSON.stringify(account, null, 2)),
			);
			console.log(
				chalk.hex("#00ff00").bold("profile", JSON.stringify(profile, null, 2)),
			);
			// console.log(
			// 	chalk.hex("#ffff00").bold("profile", JSON.stringify(email, null, 2)),
			// );

			if (account?.provider === "email") {
				const dbUser = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.email, account.providerAccountId),
				});
				if (!dbUser) {
					return false;
				}

				if (!dbUser.allowSigninWithEmail) {
					return false;
				}
			}

			const saveAddData = async () => {
				try {
					const dbUser = await db.query.users.findFirst({
						where: (users, { eq }) => eq(users.id, user.id),
					});

					const checkConfig = checkConf(dbUser?.config);

					if (dbUser) {
						await db
							.update(users)
							.set({
								banner: profile?.banner_url,
								config: checkConfig.data ?? dbUser.config,
							})
							.where(eq(users.id, user.id))
							.execute();
					}
				} catch (error) {
					console.error("error", error);
				}
			};

			try {
				const { success: isUUID, data: uuid } = z
					.string()
					.uuid()
					.safeParse(user.id);

				if (isUUID) {
					if (user.admin) {
						const adminWhitelist = await db.query.loginWhitelist.findFirst({
							where: (loginWhitelist, { eq }) => eq(loginWhitelist.userId, user.id),
						});

						if (adminWhitelist) {
							void db
								.update(loginWhitelist)
								.set({
									new: false,
									allowed: true,
									hasLoggedIn: true,
									lastLogin: new Date(),
								})
								.where(eq(loginWhitelist.userId, user.id))
								.execute();
							await saveAddData();
						} else {
							void db
								.insert(loginWhitelist)
								.values({
									email: user.email!,
									oAuthProvider: account?.provider,
									oAuthProviderAccountId: account?.providerAccountId,
									userId: user.id,
									new: false,
									allowed: true,
									hasLoggedIn: true,
									lastLogin: new Date(),
								})
								.execute();
						}

						return true;
					}

					console.log(chalk.green("User ID", uuid));
					const whitelist = await db.query.loginWhitelist.findFirst({
						where: (loginWhitelist, { eq }) => eq(loginWhitelist.userId, uuid),
					});

					if (!whitelist) {
						await db
							.insert(loginWhitelist)
							.values({
								userId: uuid,
								email: user.email!,
								oAuthProvider: account?.provider,
								oAuthProviderAccountId: account?.providerAccountId,
							})
							.execute();

						const newWhitelist = await db.query.loginWhitelist.findFirst({
							where: (loginWhitelist, { eq }) => eq(loginWhitelist.userId, uuid),
						});
						if (newWhitelist) {
							await db
								.update(users)
								.set({
									whiteListId: newWhitelist.whiteListId,
								})
								.where(eq(users.id, user.id))
								.execute();
						}

						return false;
					}

					if (!whitelist?.allowed || whitelist.new) {
						return false;
					}
					if (whitelist.allowed) {
						await db
							.update(loginWhitelist)
							.set({
								lastLogin: new Date(),
								hasLoggedIn: true,
							})
							.where(eq(loginWhitelist.userId, uuid))
							.execute();

						await saveAddData();
						return true;
					}
				}

				if (!isUUID) {
					console.log(chalk.red("Provider ID", user.id));
					const whitelist = await db.query.loginWhitelist.findFirst({
						where: (loginWhitelist, { eq }) =>
							eq(loginWhitelist.oAuthProviderAccountId, user.id),
					});

					if (!whitelist) {
						await db
							.insert(loginWhitelist)
							.values({
								email: user.email!,
								oAuthProvider: account?.provider,
								oAuthProviderAccountId: account?.providerAccountId,
							})
							.execute();

						return false;
					}

					if (!whitelist?.allowed || whitelist.new) {
						return false;
					}
					if (whitelist.allowed) {
						await db
							.update(loginWhitelist)
							.set({
								lastLogin: new Date(),
								hasLoggedIn: true,
							})
							.where(eq(loginWhitelist.oAuthProviderAccountId, user.id))
							.execute();
						await saveAddData();
						return true;
					}
				}
			} catch (error) {
				console.error(chalk.red.bold("error", error));
				return false;
			}

			return false;
		},
	},
	theme: {
		colorScheme: "dark",
		logo: "/max809.webp",
	},
	session: {
		maxAge: 10 * 24 * 60 * 60, // 10 days
	},
	pages: {
		signIn: "/api/auth/signin",
		error: "/api/auth/error",
		verifyRequest: "/api/auth/verify-request",
	},
	secret: env.NEXTAUTH_SECRET,
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}) as Adapter,
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: false,
			async profile(profile) {
				if (profile.avatar === null) {
					const defaultAvatarNumber = Number.parseInt(profile.discriminator) % 5;
					profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
				} else {
					const format = profile.avatar.startsWith("a_") ? "gif" : "png";
					profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
				}

				if (profile.banner === null) {
					profile.banner_url = null;
				} else {
					const format = profile.banner.startsWith("a_") ? "gif" : "png";
					profile.banner_url = `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${format}?size=4096&width=0&height=230`;
				}

				// console.log("profile", profile);

				return {
					id: profile.id,
					name: profile.username,
					email: profile.email,
					image: profile.image_url,
					banner: profile.banner_url,
				};
			},
		}),
		GithubProvider({
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: false,
		}),
		SpotifyProvider({
			clientId: env.SPOTIFY_CLIENT_ID,
			clientSecret: env.SPOTIFY_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: false,
		}),
		EmailProvider({
			maxAge: 60 * 60, // 1 hour
			secret: env.NEXTAUTH_SECRET,
			server: {
				host: env.EMAIL_SERVER_HOST,
				port: Number.parseInt(env.EMAIL_SERVER_PORT),
				auth: {
					user: env.EMAIL_SERVER_USER,
					pass: env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: env.EMAIL_FROM,
			async sendVerificationRequest(params) {
				const { identifier, url, provider } = params;
				const { host } = new URL(url);
				// NOTE: You are not required to use `nodemailer`, use whatever you want.
				const transport = createTransport(provider.server);
				const result = await transport.sendMail({
					to: identifier,
					from: provider.from,
					subject: `Sign in to ${host}`,
					text: text({ url, host }),
					html: emailHtml({ url, host }),
				});
				const failed = result.rejected.concat(result.pending).filter(Boolean);
				if (failed.length) {
					throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
				}
				function text({ url, host }: { url: string; host: string }) {
					return `Sign in to ${host}\n${url}\n\n`;
				}
			},
		}),
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => {
	// console.log(chalk.red("getServerAuthSession", new Error().stack));
	return getServerSession(authOptions);
};
