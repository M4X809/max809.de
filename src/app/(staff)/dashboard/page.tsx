import React from 'react'
import { onPageAllowed } from '~/lib/sUtils';
import { getServerAuthSession } from '~/server/auth';
import { CodeHighlight } from '@mantine/code-highlight';
import { Box } from '@mantine/core';
import Shell from '~/app/_components/Shell';
import { HydrateClient } from '~/trpc/server';
import DashNav from './_dash-components/DashNav';

export default async function StaffDashboard() {
    await onPageAllowed("staff");
    const session = await getServerAuthSession();
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

                        <div>
                            <CodeHighlight
                                className='rounded-lg'
                                language="json"
                                code={JSON.stringify(session, null, 2)}
                            />
                        </div>
                    </Box>
                </DashNav>
            </Shell>
        </HydrateClient>
    )
}

