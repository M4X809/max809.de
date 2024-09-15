"use client"
import type React from 'react'
import { useEffect, useState } from 'react'
import QrCodePreview from "./QrCodePreview"
import { ActionIcon, Container, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core'
import { api } from '~/trpc/react'
import { useAppStore } from '~/providers/app-store-provider'
import { useClipboard } from '@mantine/hooks'

import LoadQrConfig from './LoadQrConfig'
import { faArrowUpRightFromSquare } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { twMerge } from 'tailwind-merge'

interface QrCodePreviewContainerProps {
    codes: {
        id: string; name: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date | null;
        qrCode: string | null;
        qrLvl: number | null;
        size: number | null;
        color: string | null;
        backgroundColor: string | null;
        finderRadius: number | null;
        dotRadius: number | null;
        dataUrl: string | null;
        shareable: boolean | null;
        imageKey: string | null;
    }[],
    limits: { current: number, max: number }
    userId: string
    baseURL: string
}

const QrCodePreviewContainer: React.FC<QrCodePreviewContainerProps> = ({ codes, limits, userId, baseURL }) => {

    const { data, isLoading, isError, refetch, } = api.codes.getQrCodes.useQuery(undefined, { initialData: { codes, limits }, enabled: !!userId })
    const refetchCodes = useAppStore((state) => state.refetchCodes)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        refetch()
    }, [refetchCodes])

    const { copied, copy } = useClipboard({ timeout: 500 })
    const [copiedName, setCopiedName] = useState<string | null>(null)

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error</div>
    if (!data) return <div>No data</div>

    const QrCodes = data.codes.map((code) => {


        const DateElement = () => {
            if (!code.createdById) return <Text c={"dimmed"}>Unknown</Text>
            const date = new Date(code.updatedAt as any)
            return <Text component='span' c={"dimmed"}>{date.toLocaleTimeString("de-DE")}</Text>
        }

        return (
            <Container key={code.id} bg={"rgba(255,255,255,0.1)"} p={20} size={"sm"} w={500} maw={"100dvw"} className="rounded-lg">


                <Group justify='space-between' grow gap={0} mah={500} wrap='nowrap'>
                    <Stack gap={0}>
                        <Title order={2}>{code.name}</Title>
                        <Tooltip bg={"transparent"} position='bottom' label={
                            <Paper
                                p={15}
                                w={200}
                                h={"auto"}
                                withBorder
                                className='rounded-xl bg-gradient-to-tr from-[#222840] to-[#2347a1]'
                                c={"white"}

                                styles={{
                                    root: {
                                        wordBreak: "break-all",
                                        textWrap: "wrap"
                                    },
                                }}>
                                {code.qrCode}
                            </Paper>}
                        >
                            <Text truncate w={350} c={"dimmed"}> Value: {code.qrCode}</Text>
                        </Tooltip>
                        <Text className='text-nowrap' c={"dimmed"}> Created / Updated At:  <DateElement /></Text>
                    </Stack>
                    <QrCodePreview data={code} w={100} />
                </Group>
                <Group id='QR-Code-Actions-Bottom' justify='space-between' align='center' >
                    <Group id='QR-Code-Actions-Buttons' wrap='nowrap' >
                        <Tooltip
                            transitionProps={{ transition: "fade", }}
                            classNames={{
                                tooltip: 'bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white'
                            }} label='Share QR Code' >
                            <LoadQrConfig data={code} variant='light'
                            />
                        </Tooltip>
                        <Tooltip
                            // w={200}
                            maw={"100dvw"}
                            styles={{
                                tooltip: {
                                    wordBreak: "break-word",
                                    textWrap: "wrap"
                                },
                            }}
                            events={{ hover: true, focus: true, touch: !code.shareable }}
                            transitionProps={{ transition: "fade", }}
                            classNames={{
                                tooltip: 'bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white border border-[#4b4b4b]'
                            }} label={
                                code.shareable ? 'Copy QR Code link.' : <Text fz={13} w={200}
                                    maw={"100dvw"} >
                                    This QR Code is not shareable. <br />
                                    Use the arrow button to load it into the QR Code Generator, then save it with sharing enabled.
                                </Text>
                            } >
                            <ActionIcon
                                variant='light'
                                className={twMerge("transition-colors duration-500", copied && copiedName === code.name && code.shareable ? "bg-green-800 text-green-200 hover:bg-green-800 hover:text-green-200" : "")}
                                disabled={!code.shareable}
                                onClick={() => {
                                    setCopiedName(code.name)
                                    copy(`${baseURL}/qr-code-generator/${code.id}`)
                                }}>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                            </ActionIcon>
                        </Tooltip>

                    </Group>
                    <Text fz={11} c={"dimmed"} >
                        {code.id}
                    </Text>
                </Group>





            </Container>
        )
    })

    return (
        <>
            <Text pos={"static"} c={"dimmed"} fz={13} >
                {data.limits.current} / {data.limits.max} Save slots
            </Text>
            <Group wrap="wrap" grow justify="center">
                {QrCodes}
            </Group>
        </>
    )
}

export default QrCodePreviewContainer