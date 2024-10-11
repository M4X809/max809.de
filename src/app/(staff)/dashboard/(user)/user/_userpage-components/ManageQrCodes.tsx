import { AccordionControl, AccordionItem, AccordionPanel, Box, TextInput, Text, ScrollArea, Stack, Center, ActionIcon, Tooltip, Paper, ActionIconGroup, TooltipFloating, Group } from "@mantine/core";
import type { User } from "../../../_dash-components/UserCard";
import { api } from "~/trpc/server";
import { hasPermission } from "~/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faEye, faTrashCan } from "@fortawesome/pro-duotone-svg-icons";
import { ActionGroup, PreviewCode, SetLimitInput } from "./QrCodeClient";
import { getServerAuthSession } from "~/server/auth";
import ClientIcon from "~/app/_components/ClientIcon";


export default async function ManageQrCodes({ id, }: { id: User["id"] }) {
    if (!await hasPermission("viewQrStats")) return null;
    const session = await getServerAuthSession();
    const qrData = await api.management.getQrCodeData({ id: id })

    const Row1 = async () => {
        return (
            <Box className='grid md:grid-cols-2 grid-cols-1 gap-4'>
                {await hasPermission("viewQrPreview") && <PreviewCode />}
                <Box>
                    {await hasPermission("changeQrLimits") && <SetLimitInput
                        id={id}
                        session={session}
                        currentLimit={qrData.limit}
                    />}
                    {!await hasPermission("changeQrLimits") &&
                        <Center
                            className="bg-[rgba(255,255,255,0.1)] rounded-lg p-2 h-full m-auto"
                        >
                            <Text fz={18} fw={500} c={"lightgray"} >
                                Limit: {qrData.limit}
                            </Text>
                        </Center>
                    }
                </Box>
                <Box className="bg-[rgba(255,255,255,0.1)] rounded-lg p-2 h-full">
                    {qrData.codes.length > 0 && <ScrollArea
                        scrollbars="y"
                        className="md:h-[calc(3rem*3+4px)] h-[calc(3rem*4+6px)]  w-full"
                        type="auto"
                        offsetScrollbars
                    >
                        <Stack gap={2}>
                            {qrData.codes.map(async (code, index) => {
                                return (
                                    <Box key={code.id} className='h-12 grid grid-cols-6 gap-4'>
                                        <Stack gap={0} className="col-span-3 h-fit">
                                            <Group align="center" wrap="nowrap">
                                                <Text fz={18} fw={500} c={"white"} truncate>
                                                    {code.name}
                                                </Text>
                                            </Group>
                                            <TooltipFloating
                                                disabled={!code.qrCode}
                                                classNames={{
                                                    tooltip: " border border-gray-700 border-solid rounded-lg p-0"
                                                }}
                                                label={
                                                    <Paper
                                                        p={15}
                                                        maw={250}
                                                        h={"auto"}
                                                        bg={"transparent"}
                                                        c={"lightgray"}
                                                        styles={{
                                                            root: {
                                                                wordBreak: "break-all",
                                                                textWrap: "wrap"
                                                            },
                                                        }}>
                                                        {code.qrCode}
                                                    </Paper>}
                                            >
                                                <Text fz={15} fw={500} c={"lightgray"} truncate inline className="text-nowrap">
                                                    {code.qrCode ?? ` QR Code ${index + 1}`}
                                                </Text>
                                            </TooltipFloating>
                                        </Stack>
                                        {code.shareable && code.qrCode && <Text component="span" title="Public Code" className="flex place-items-center align-middle col-span-1" fz={18} px={3} c={"lightgray"} >
                                            <ClientIcon icon={faArrowUpRightFromSquare} />
                                        </Text>}
                                        {(!code.shareable || !code.qrCode) && <Box className="col-span-1" />}
                                        {await hasPermission(["viewQrPreview", "deleteQrCode"]) && <Box className='col-span-2 flex justify-end px-5 place-items-center'>
                                            <ActionGroup
                                                session={session}
                                                qrId={code.id}
                                                userId={id}
                                            />
                                        </Box>}
                                    </Box>
                                )
                            })}
                        </Stack>
                    </ScrollArea>}
                    {qrData.codes.length === 0 &&
                        <Box className=" gap-4 place-items-center justify-center flex h-full">
                            <Stack>
                                <Text fz={18} fw={500}  >
                                    No QR Codes Found
                                </Text>
                            </Stack>
                        </Box>
                    }
                </Box>
            </Box>
        )

    }

    return (
        <AccordionItem
            value="qr-codes"
            className="bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg"
        >
            <AccordionControl >
                <Text size="xl"> QR Codes </Text>
            </AccordionControl>
            <AccordionPanel>
                <Row1 />
            </AccordionPanel>
        </AccordionItem>
    )
} 