import { Box, Center, Group, Text, VisuallyHidden } from "@mantine/core"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { hasPermission, onPageAllowed } from "~/lib/sUtils"
import { getServerAuthSession } from "~/server/auth"
import { api } from "~/trpc/server"
import { ActionButtons, LastLogin, Search, WhitelistPagination } from "./ClientWhitelist"

import { whitelistParamsCache } from "./whitelistParams"
import { faArrowsRotate } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SubmitButton } from "~/app/_components/SubmitButton"
import { refreshAction } from "~/app/RefreshAction"
import type { Metadata } from "next"


export const metadata: Metadata = {
    metadataBase: new URL('https://max809.de'),
    title: "Login Whitelist",
    openGraph: {
        title: "Login Whitelist",
        images: [
            {
                url: "/max809.webp",
                width: 1200,
                height: 630,
                alt: "max809.de",
            },
        ],
        type: "website",
        siteName: "max809.de",
        url: "https://max809.de/dashboard/login-whitelist",
        locale: "en_US",
    }

}



export default async function LoginWhitelist({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    await onPageAllowed("viewWhitelist")
    const { limit, page, search } = whitelistParamsCache.parse(searchParams)
    const whiteList = await api.whitelist.getWhitelist({ page, limit, search: search })
    const refreshActionWithPath = refreshAction.bind(null, "/dashboard/login-whitelist")
    const session = await getServerAuthSession()


    return (
        <Box className="rounded-lg bg-[rgba(255,255,255,0.1)] backdrop-blur-lg py-8 px-5 w-full h-fit">
            <Group justify="space-between" align="center">
                <Group>
                    <form action={refreshActionWithPath}>
                        <SubmitButton
                            variant='light'
                            className="data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed"
                        >
                            <VisuallyHidden>Refresh</VisuallyHidden>
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </SubmitButton>
                    </form>
                    <Search />
                </Group>

                <WhitelistPagination totalRows={whiteList.total} />


            </Group>


            <Table className="w-full ">
                <TableCaption>Login Whitelist.</TableCaption>
                <TableHeader className="hover:bg-transparent">
                    <TableRow className="hover:bg-transparent text-white flex-nowrap">
                        {/* <TableHead className="w-[250px]">Whitelist ID</TableHead> */}
                        <TableHead className="w-[250px]">User ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>OA2 Account ID</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>
                            <Center>New</Center>
                        </TableHead>
                        <TableHead>
                            <Center>Status</Center>
                        </TableHead>
                        <TableHead>
                            <Center>Last Login</Center>
                        </TableHead>

                        {await hasPermission(["editWhitelistStatus", "deleteWhitelistEntry"]) && <TableHead>
                            <Center>Actions</Center>
                        </TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        whiteList.data.map(async (whitelist) => {
                            return (
                                <TableRow key={whitelist.whiteListId} className="hover:bg-transparent text-white">
                                    {/* <TableCell >
                                        <Text truncate fz={14} inline >
                                            {whitelist.whiteListId}
                                        </Text>
                                    </TableCell> */}
                                    <TableCell>
                                        <Text truncate fz={14} inline >
                                            {whitelist.userId}
                                        </Text>
                                    </TableCell>
                                    <TableCell>{whitelist.email}</TableCell>
                                    <TableCell>{whitelist.oAuthProviderAccountId}</TableCell>
                                    <TableCell>
                                        <Text truncate fz={14} inline tt={"capitalize"} >
                                            {whitelist.oAuthProvider}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <Center>{whitelist.new ? <Text fz={14} inline c={"green"}>Yes</Text> : <Text fz={14} inline c={"red"}>No</Text>}</Center>
                                    </TableCell>
                                    <TableCell>
                                        <Center>{whitelist.allowed ? <Text fz={14} inline c={"green"}>Allowed</Text> : <Text fz={14} inline c={"red"}>Denied</Text>}</Center>
                                    </TableCell>
                                    <TableCell>
                                        <Center>
                                            {whitelist.lastLogin ?
                                                <LastLogin date={whitelist.lastLogin} />
                                                : "Never"
                                            }
                                        </Center>
                                    </TableCell>

                                    {await hasPermission(["editWhitelistStatus", "deleteWhitelistEntry"]) && <TableCell>
                                        <Center>
                                            <ActionButtons
                                                whiteListId={whitelist.whiteListId}
                                                session={session}
                                                allowed={whitelist.allowed}
                                            />
                                        </Center>
                                    </TableCell>}

                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </Box >
    )
}
