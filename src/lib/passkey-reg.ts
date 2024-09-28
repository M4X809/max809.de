"use server";

// This is *your* server-side code; you need to implement this yourself.
// NextAuth takes care of logging in the user after they have registered their passkey.

import { tenant } from "@teamhanko/passkeys-next-auth-provider";
import { env } from "~/env.js";
import { getServerAuthSession } from "~/server/auth";

const passkeyApi = tenant({
	apiKey: env.PASSKEYS_API_KEY,
	tenantId: env.NEXT_PUBLIC_PASSKEYS_TENANT_ID,
});

export async function startServerPasskeyRegistration() {
	const session = await getServerAuthSession();
	if (!session?.user?.id || !session.user.name) throw new Error("Not logged in");

	const createOptions = await passkeyApi.registration.initialize({
		userId: session.user.id,
		username: session.user.name,
	});

	return createOptions;
}

export async function finishServerPasskeyRegistration(credential: any) {
	const session = await getServerAuthSession();
	if (!session) throw new Error("Not logged in");

	await passkeyApi.registration.finalize(credential);
	return { success: true };

	// Now the user has registered their passkey and can use it to log in.
	// You don't have to do anything else here.
}
