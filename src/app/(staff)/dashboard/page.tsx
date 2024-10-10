import { notFound, redirect } from 'next/navigation';
import React from 'react'
import Shell from '~/app/_components/Shell';
import { isStaff, onPageAllowed } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { HydrateClient } from '~/trpc/server';
import DashNav from './_dash-components/DashNav';
import { Box } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';


export default async function StaffDashboard() {
    await onPageAllowed("staff");
    const session = await getServerAuthSession();




    return (
        <div>
            <CodeHighlight
                className='rounded-lg'
                language="json"
                code={JSON.stringify(session, null, 2)}
            />
        </div>

        // <HydrateClient>
        //     <Shell
        //         title='Staff Dashboard'
        //         redirect={"/"}
        //         withLoginButton
        //         withHomeButton
        //         withDashboardButton={false}
        //         session={session}
        //     >
        //         <DashNav session={session}>

        //             <>
        //                 <Box>
        //                     TEST
        //                 </Box>
        //             </>


        //         </DashNav>
        //     </Shell>
        // </HydrateClient>
    )
}

