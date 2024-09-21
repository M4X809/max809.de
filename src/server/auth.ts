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
		limit: number;
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
		async session({ session, user }: { session: Session; user: User }) {
			return {
				...session,
				user: {
					...session.user,
					...user,
				},
			};
		},
		async redirect({ url, baseUrl }) {
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
			console.log("sign in allowed", signInAllowed, user.id);
			if (!signInAllowed) {
				return false;
			}
			client.capture({
				event: "sign-in",
				distinctId: user.id,
			});
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
export const getServerAuthSession = () => getServerSession(authOptions);
