import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
	getServerSession,
	type Session,
	type User,
	type DefaultSession,
	type NextAuthOptions,
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

import { tenant } from "@teamhanko/passkeys-next-auth-provider";

import PasskeyProvider from "@teamhanko/passkeys-next-auth-provider";

import chalk from "chalk";

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
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}
	// @ts-ignore
	interface User extends AdapterUser {
		limit?: number;
	}

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
		async session({
			session,
			user,
			newSession,
		}: {
			session: Session;
			user: User;
			newSession: any;
		}) {
			console.log(chalk.red("session"), session, user, newSession);
			return {
				...session,
				user: {
					...session.user,
					...user,
				},
			};
		},
		async redirect({ url, baseUrl }) {
			// console.log(chalk.yellow("redirect"));
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
		async signIn({ user }) {
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
			console.log(
				chalk
					.hex("#ff0000")
					.bold(
						"sign in",
						signInAllowed ? chalk.green("allowed") : chalk.red("not allowed"),
					),

				user.id,
			);
			if (!signInAllowed) {
				return false;
			}
			client.capture({
				event: "sign-in",
				distinctId: user.id,
			});
			return true;
		},
		async jwt(params) {
			console.log(chalk.yellow("jwt"), params);
			return params;
		},
	},
	theme: {
		colorScheme: "dark",
		logo: "/max809.webp",
	},
	session: {
		// strategy: "jwt",
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
		}),
		GithubProvider({
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: false,
		}),
		PasskeyProvider({
			id: "passkeys",
			tenant: tenant({
				apiKey: env.PASSKEYS_API_KEY,
				tenantId: env.NEXT_PUBLIC_PASSKEYS_TENANT_ID,
				baseUrl: "http://localhost:3000",
			}),
			async authorize({ userId, token }) {
				const user = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, userId),
				});

				if (!user) {
					throw new Error("User not found");
				}
				console.log("user", user);

				return user as User;
				// return {
				// 	id: user.id,
				// 	name: user.name,
				// 	email: user.email,
				// 	image: user.image,
				// 	limit: user.limit,
				// };
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
export const getServerAuthSession = () => getServerSession(authOptions);
