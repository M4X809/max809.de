"use client"
import type React from 'react'
import { useEffect } from 'react'
import QrCodePreview, { QrCodePreviewProps, type QrCodeData } from "./QrCodePreview"
import { AspectRatio, Box, Container, Grid, GridCol, Group, Stack, Text, Title } from '@mantine/core'
import { api } from '~/trpc/react'
import { useAppStore } from '~/providers/app-store-provider'

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
    }[],
    limits: { current: number, max: number }
    userId: string
}

const QrCodePreviewContainer: React.FC<QrCodePreviewContainerProps> = ({ codes, limits, userId }) => {

    const { data, isLoading, isError, refetch } = api.codes.getQrCodes.useQuery(undefined, { initialData: { codes, limits } })

    const setRefetchCodes = useAppStore((state) => state.setRefetchCodes)
    const refetchCodes = useAppStore((state) => state.refetchCodes)

    useEffect(() => {
        if (!refetchCodes) {

            setRefetchCodes(refetch)
        }
    }, [refetch, setRefetchCodes, refetchCodes])




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

                    </GridCol>

                    <Group justify="end" w={"100%"} p={0}>

                        <Text fz={11} c={"dimmed"}>{code.id}</Text>
                    </Group>

                </Grid>
            </Container>
            // {/* </AspectRatio> */}
        )

    })


    return (
        <>
            <Text pos={"static"} c={"dimmed"} fz={13} >
                {limits.current} / {limits.max} Save slots
            </Text>
            <Group wrap="wrap" grow justify="center">
                {QrCodes}
            </Group>
        </>
    )
}

export default QrCodePreviewContainer