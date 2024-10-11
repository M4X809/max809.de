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
import { PostHog } from "posthog-node";

import { env } from "~/env";
import { db } from "~/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "~/server/db/schema";

import { eq } from "drizzle-orm";
import { checkConf } from "~/lib/utils";

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
		staff?: boolean;
		permissions?: string[];
		email?: string;
		config?: Config;
	}

	interface Config {
		userPage?: {
			expanded?: string[];
		};
	}

	type SessionType = Session | null | undefined;

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		async session({ session, user }: { session: Session; user: User }) {
			return {
				...session,
				user: {
					...session.user,
					...user,
					email: undefined,
					emailVerified: undefined,
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
			profile,
		}: {
			user: User | AdapterUser;
			account: Account | null;
			profile?: Profile & { image_url?: string; banner_url?: string };
		}) {
			client.identify({
				distinctId: user.id,
				properties: {
					name: `${user.name}${env.NODE_ENV === "development" ? " DEV" : ""}`,
					id: user.id,
				},
			});
			const signInAllowed = await client.isFeatureEnabled("sign-in", user.id);
			client.capture({
				event: "sign-in",
				distinctId: user.id,
			});
			console.log("sign in allowed", signInAllowed, user.id);
			if (!signInAllowed) {
				return false;
			}
			client.capture({
				event: "sign-in",
				distinctId: user.id,
			});

			try {
				const dbUser = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, user.id),
				});

				const checkConfig = checkConf(dbUser?.config);

				console.log(
					"checkConfig",
					checkConfig.success,
					checkConfig.data,
					checkConfig.error,
				);

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

			return true;
		},
	},
	theme: {
		colorScheme: "dark",
		logo: "/max809.webp",
	},
	session: {
		maxAge: 10 * 24 * 60 * 60, // 10 days
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
