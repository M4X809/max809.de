import { Box } from "@mantine/core";
import Shell from "~/app/_components/Shell";
import { HydrateClient } from "~/trpc/server";
import DashNav from "../../../_dash-components/DashNav";
import { getServerAuthSession } from "~/server/auth";

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession()

    return (
        <HydrateClient>
            <Shell
                title='Staff Dashboard'
                redirect={"/dashboard"}
                withLoginButton
                withHomeButton
                withDashboardButton={false}
                session={session}
            >
                <DashNav session={session}>
                    <Box className="h-full w-full mt-10" >

                        {children}
                    </Box>
                </DashNav>
            </Shell>
        </HydrateClient>
    );
}
