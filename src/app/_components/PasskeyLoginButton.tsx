"use client";

import { Button } from "@mantine/core";
import { signInWithPasskey } from "@teamhanko/passkeys-next-auth-provider/client";
import { env } from "~/env";

const PasskeyLoginButton = () => {
    return (
        <Button
            onClick={() => {
                signInWithPasskey({ tenantId: env.NEXT_PUBLIC_PASSKEYS_TENANT_ID, baseUrl: "http://localhost:3000" })
            }}
        >
        </Button>
    )
}

export default PasskeyLoginButton