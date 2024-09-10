"use client"
import { Box, Button, Center, ColorInput, Container, Divider, Grid, Group, Modal, NumberInput, SegmentedControl, Slider, Stack, Text, TextInput, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
// import QRCode from 'react-qrcode-js'

import MyCanvas from './QrCode';

import { useAppStore } from "~/providers/app-store-provider";
import { useDisclosure } from '@mantine/hooks';
import { api } from '~/trpc/react';


const QrCode = () => {

    const { mutate, isPending, isSuccess } = api.codes.createQrCode.useMutation()

    const session = useAppStore((state) => state.session)

    const saveTitle = useAppStore((state) => state.saveTitle)
    const setSaveTitle = useAppStore((state) => state.setSaveTitle)


    const qrCode = useAppStore((state) => state.qrCode)
    const setQrCode = useAppStore((state) => state.setQrCode)
    // const qrCodeLength = useAppStore((state) => state.qrCodeLength)
    // const setQrCodeLength = useAppStore((state) => state.setQrCodeLength)

    const qrLvl = useAppStore((state) => state.qrLvl)
    const setQrLvl = useAppStore((state) => state.setQrLvl)

    const size = useAppStore((state) => state.size)
    const setSize = useAppStore((state) => state.setSize)

    const color = useAppStore((state) => state.color)
    const setColor = useAppStore((state) => state.setColor)

    const backgroundColor = useAppStore((state) => state.backgroundColor)
    const setBackgroundColor = useAppStore((state) => state.setBackgroundColor)

    const finderRadius = useAppStore((state) => state.finderRadius)
    const setFinderRadius = useAppStore((state) => state.setFinderRadius)

    const dotRadius = useAppStore((state) => state.dotRadius)
    const setDotRadius = useAppStore((state) => state.setDotRadius)

    const refetchCodes = useAppStore((state) => state.refetchCodes)

    const canvasRef = useAppStore((state) => state.canvasRef)


    const [opened, { toggle }] = useDisclosure(false)



    const download = (type: "image/png" | "image/webp") => {
        if (!canvasRef?.current) return
        console.log("downloading")
        // setDownloading(true)
        const link = document.createElement("a");



        const url = canvasRef.current.toDataURL(type)
        link.download = "qr-code"
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // return url || ""
    }

    useEffect(() => {
        if (isSuccess) {
            setSaveTitle("")
            toggle()
            if (refetchCodes) refetchCodes()

        }
    }, [isSuccess, refetchCodes, setSaveTitle, toggle])




    return (
        <Container fluid>
            <Grid gutter={10} columns={20} mt={10} mb={10} justify='center' align='center'>
                <Grid.Col span={{ base: 20, md: 10 }}>
                    <Stack className='h-full w-full' >
                        <Center >
                            {/* <Box h={"auto"} w={500}> */}
                            <MyCanvas style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                            {/* </Box> */}

                        </Center>
                        {canvasRef?.current &&
                            <>
                                <Button.Group className='w-[500] flex justify-center'  >
                                    <Button
                                        onClick={() => {
                                            download("image/png")
                                        }}
                                        w={250}
                                        variant="outline"
                                        color="blue"

                                    >
                                        Download as PNG

                                    </Button>

                                    <Button
                                        w={250}
                                        onClick={() => {
                                            download("image/webp")
                                        }}
                                        variant="outline"
                                        color="blue"

                                    >
                                        Download as WEBP
                                    </Button>
                                </Button.Group>
                                {!!session?.user?.id && <Button variant='gradient'
                                    onClick={() => toggle()}
                                    w={500} className='flex self-center'>
                                    Save QR Code
                                </Button>}
                                <Modal
                                    overlayProps={{
                                        blur: 2,

                                    }}

                                    classNames={{
                                        body: "bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white",
                                    }}
                                    opened={opened && !!session?.user}
                                    withCloseButton={false}
                                    onClose={() => toggle()}

                                >
                                    <Stack gap={2}>
                                        <Title order={2} ta='center' className='text-white'>
                                            Save QR Code
                                        </Title>

                                        <TextInput
                                            styles={{
                                                wrapper: {
                                                    background: "transparent",
                                                },
                                                input: {
                                                    background: "rgba(255,255,255,0.05)",
                                                }
                                            }}
                                            w={"100%"}
                                            label="Title"
                                            placeholder="My QR Code"
                                            value={saveTitle}
                                            onChange={(e) => setSaveTitle(e.target.value.replaceAll(" ", "_"))}
                                        />

                                        <Button
                                            fullWidth
                                            // w={500}
                                            loading={isPending}
                                            onClick={() => {
                                                if (!qrCode || !session?.user.id || !saveTitle) return

                                                mutate({
                                                    name: saveTitle,
                                                    qrCode: qrCode,
                                                    qrLvl: qrLvl,
                                                    size: size,
                                                    color: color,
                                                    backgroundColor: backgroundColor,
                                                    finderRadius: finderRadius,
                                                    dotRadius: dotRadius,
                                                })
                                                // download("image/png")
                                            }}
                                            // variant=""
                                            // unstyled
                                            // bg={"inherit"}
                                            style={{
                                                "--button-hover": "rgba(255,255,255,0.2)",
                                                "--button-bg": "rgba(255,255,255,0.1)",
                                            }}
                                            classNames={{
                                                root: " bg-red-500 hover:bg-red-700",
                                            }}
                                            // bg={"rgba(255,255,255,0.1)"}
                                            color="blue"

                                        >
                                            Save
                                        </Button>

                                    </Stack>

                                </Modal>
                            </>
                        }
                    </Stack>

                </Grid.Col>
                <Grid.Col span={{ base: 20, md: 10 }} >
                    <Center className='h-full w-full'  >
                        <Stack className='h-full w-full' >
                            <Stack>
                                <TextInput
                                    // bg={"rgba(255,255,255,0.1)"}
                                    styles={{
                                        wrapper: {
                                            background: "transparent",

                                        },
                                        input: {
                                            background: "rgba(255,255,255,0.05)",
                                        }
                                    }}
                                    w={"100%"}
                                    label="QR Code Value"
                                    placeholder="QR Code"
                                    value={qrCode}
                                    onChange={(e) => setQrCode(e.target.value)}
                                />


                                <NumberInput label="Image Size"
                                    description="The size of the QR Code in pixels. (Most important for downloading)"
                                    styles={{
                                        wrapper: {
                                            background: "transparent",
                                        },
                                        input: {
                                            background: "rgba(255,255,255,0.05)",
                                        }
                                    }}
                                    clampBehavior="strict"
                                    value={size}
                                    startValue={size}
                                    onChange={setSize}
                                    allowDecimal={false}
                                    allowLeadingZeros={false}
                                    allowNegative={false}
                                    stepHoldDelay={200}
                                    stepHoldInterval={100}
                                    step={100}
                                    min={512}
                                    max={4096}
                                />

                                <ColorInput
                                    label="Qr Code Color"
                                    value={color}
                                    onChange={setColor}
                                    // onBlur={(e) => setQRColor(e.target.value)}
                                    styles={{
                                        input: {
                                            background: "rgba(255,255,255,0.05)",
                                        }
                                    }}
                                    format='rgba'


                                />
                                <ColorInput
                                    label="Background Color"
                                    value={backgroundColor}
                                    onChange={setBackgroundColor}
                                    // onBlur={(e) => setQRColor(e.target.value)}
                                    styles={{
                                        input: {
                                            background: "rgba(255,255,255,0.05)",
                                        }
                                    }}
                                    format='rgba'


                                />

                                <Stack gap={0} m={0} >
                                    <Divider size={"md"} my={5} />
                                    <Text size="lg" >
                                        Advanced Options
                                    </Text>
                                    <Text c={"dimmed"} fw={500} inline fz={"sm"} >
                                        These options are for advanced users only. Options with * may stop the QR Code from being scanned by some scanners.
                                    </Text>

                                    <Stack gap={0} mt={15}>

                                        <Text size="sm" fw={500} >
                                            Error Correction Level
                                        </Text>

                                        <Text size="xs" fw={500} c={"dimmed"} >
                                            Advanced Option. <Text component='a' inline c={"blue"} td={"underline"} href='https://www.qrcode.com/en/about/error_correction.html' target='_blank'>Learn more</Text>
                                        </Text>
                                        <SegmentedControl
                                            mt={2}
                                            bd={"1px solid #424242"}

                                            styles={{
                                                input: {
                                                    background: "rgba(255,255,255,0.05)",
                                                    border: "1px solid #4b4b4b",
                                                },
                                                root: {
                                                    background: "rgba(255,255,255,0.05)",
                                                    border: "1px solid #4b4b4b",
                                                },
                                                indicator: {
                                                    background: "rgba(255,255,255,0.07)",
                                                }
                                            }}
                                            value={qrLvl.toString()}
                                            onChange={setQrLvl as any}
                                            data={[
                                                { label: "L", value: "1" },
                                                { label: "M", value: "0" },
                                                { label: "Q", value: "3" },
                                                { label: "H", value: "2" },
                                                // { label: "4", value: "4" },
                                            ]}
                                        />
                                    </Stack>

                                    <Group justify='space-between' grow >
                                        <Stack mt={15} gap={0} >
                                            <Group p={0} wrap='nowrap' gap={1}>
                                                <Text size="sm" fw={500} >
                                                    Finder Dot Size
                                                </Text>
                                                <Text c={"red"} fw={900}>*</Text>
                                            </Group>
                                            <Text size="sm" >
                                                Value: {finderRadius.toFixed(1)}
                                            </Text>
                                            {/* <Text size="sm" fw={500} className='text-nowrap'  >
                                            Error Correction Level <Text c={"red"} fw={900}>*</Text>
                                        </Text> */}


                                            {/* <Text size="xs" fw={500} c={"dimmed"} >
                                            Advanced Option. <Text component='a' inline c={"blue"} td={"underline"} href='https://www.qrcode.com/en/about/error_correction.html' target='_blank'>Learn more</Text>
                                        </Text> */}
                                            <Slider
                                                mt={15}
                                                // label="Finder Dot Size"
                                                value={finderRadius}
                                                onChange={setFinderRadius}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                            // onChangeEnd={setFinderRadius}
                                            />
                                        </Stack>
                                        <Stack mt={15} gap={0}>
                                            <Group p={0} wrap='nowrap' gap={1}>
                                                <Text size="sm" fw={500} >
                                                    Dot Size
                                                </Text>
                                                <Text c={"red"} fw={900}>*</Text>
                                            </Group>
                                            <Text size="sm" >
                                                Value: {finderRadius.toFixed(1)}
                                            </Text>
                                            {/* <Text size="sm" fw={500} className='text-nowrap'  >
                                            Error Correction Level <Text c={"red"} fw={900}>*</Text>
                                        </Text> */}


                                            {/* <Text size="xs" fw={500} c={"dimmed"} >
                                            Advanced Option. <Text component='a' inline c={"blue"} td={"underline"} href='https://www.qrcode.com/en/about/error_correction.html' target='_blank'>Learn more</Text>
                                        </Text> */}
                                            <Slider
                                                mt={15}
                                                // label="Finder Dot Size"
                                                value={dotRadius}
                                                onChange={setDotRadius}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                            // onChangeEnd={setFinderRadius}
                                            />
                                        </Stack>

                                    </Group>


                                </Stack>

                            </Stack>
                        </Stack>
                    </Center>
                </Grid.Col>
                {/* <Grid.Col span={{ base: 20, md: 10 }} mt={20} hidden={!session}>
                    <Center className='h-full w-full'  >
                        <Stack  >

                            <Title>
                                Saved QR Codes
                            </Title>

                        </Stack>
                    </Center>
                </Grid.Col> */}
            </Grid>
        </Container >
    )
}

export default QrCode