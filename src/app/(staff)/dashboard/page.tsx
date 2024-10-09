import { notFound } from 'next/navigation';
import React from 'react'
import Shell from '~/app/_components/Shell';
import { isStaff } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { HydrateClient } from '~/trpc/server';
import DashNav from './_dash-components/DashNav';
import { Box } from '@mantine/core';


export default async function StaffDashboard() {
    const session = await getServerAuthSession();
    // console.log("session", session)
    const staff = await isStaff()
    if (!staff) return notFound()



    return (
        <div>
            test
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

