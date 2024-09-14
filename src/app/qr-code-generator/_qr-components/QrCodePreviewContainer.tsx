"use client"
import type React from 'react'
import { useEffect, useState } from 'react'
import QrCodePreview, { QrCodePreviewProps, type QrCodeData } from "./QrCodePreview"
import { AspectRatio, Box, Container, Grid, GridCol, Group, Stack, Text, Title } from '@mantine/core'
import { api } from '~/trpc/react'
import { useAppStore } from '~/providers/app-store-provider'
import Image from 'next/image'
import { useClipboard } from '@mantine/hooks'

import { env } from "~/env"
import LoadQrConfig from './LoadQrConfig'

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
}

const QrCodePreviewContainer: React.FC<QrCodePreviewContainerProps> = ({ codes, limits, userId }) => {

    const { data, isLoading, isError, refetch, } = api.codes.getQrCodes.useQuery(undefined, { initialData: { codes, limits }, enabled: !!userId })



    // const setRefetchCodes = useAppStore((state) => state.setRefetchCodes)
    const refetchCodes = useAppStore((state) => state.refetchCodes)


    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        refetch()
    }, [refetchCodes])

    // console.log(data)

    const { copied, copy } = useClipboard({ timeout: 500 })

    const [copiedName, setCopiedName] = useState<string | null>(null)

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error</div>
    if (!data) return <div>No data</div>


    const QrCodes = data.codes.map((code) => {


        return (
            // <AspectRatio key={code.id} ratio={4 / 1} maw={500} >

            <Container key={code.id} bg={"rgba(255,255,255,0.1)"} p={20} size={"sm"} w={450} className="rounded-lg">
                <Grid columns={5}>
                    <GridCol span={"auto"}>
                        <Stack gap={0}>
                            <Title order={2}>{code.name}</Title>
                            <Text c={"dimmed"}> Value: <Text c={"white"} component="span" truncate>"{code.qrCode}"</Text></Text>

                        </Stack>
                    </GridCol>
                    <GridCol span={"content"} mx={20} className='rounded-xl' >


                        <QrCodePreview data={code} />

                        {/* <Image src={code.dataUrl || ""} alt="qr-code" width={100} height={100} /> */}

                    </GridCol>

                    <Group justify="space-between" w={"100%"} p={0}>
                        <LoadQrConfig data={code} />

                        <Text fz={11} c={copied && copiedName === code.name && code.shareable ? "white" : "dimmed"} td={"underline"} className={code.shareable ? 'cursor-pointer' : ''} onClick={() => {
                            if (!code.shareable) return
                            setCopiedName(code.name)
                            copy(`${env.NEXT_PUBLIC_NODE_ENV === "development" ? "http://localhost:3000" : "https://max809.de"}/qr-code-generator/${code.id}`)
                        }}>
                            {code.shareable && <Text fz={11} component='span'> Click to Share</Text>} {code.id}
                        </Text>
                    </Group>

                </Grid>
            </Container>
            // {/* </AspectRatio> */}
        )

    })


    return (
        <>
            <Text pos={"static"} c={"dimmed"} fz={13} >
                {data.limits.current} / {data.limits.max} Save slots
            </Text>
            <Group wrap="wrap" grow justify="center">
                {QrCodes}
                {/* <QrCodes /> */}
            </Group>
        </>
    )
}

export default QrCodePreviewContainer