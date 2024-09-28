// This is your client-side code. NextAuth takes care of logging in the user after they have registered their passkey using registerPasskey function.

"use client"

import {
    finishServerPasskeyRegistration,
    startServerPasskeyRegistration,
} from "~/lib/passkey-reg";
import { create } from "@github/webauthn-json";
import { Button } from "@mantine/core";

export default function RegisterNewPasskey() {
    async function registerPasskey() {
        const createOptions = await startServerPasskeyRegistration();

        // Open "register passkey" dialog
        const credential = await create(createOptions as any);

        await finishServerPasskeyRegistration(credential);

        // Now the user has registered their passkey and can use it to log in.
    }

    return (
        <Button onClick={async () => await registerPasskey()}>Register a new passkey</Button>
    );
}
