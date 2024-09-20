"use client"
import { faBan, faCheckSquare, faArrowUpRightFromSquare } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Modal, Group, Box, Text } from "@mantine/core"
import { Dropzone, type FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useDisclosure } from "@mantine/hooks"
// @ts-ignore
import QrcodeDecoder from "qrcode-decoder/dist/index.esm"
import { useState, useEffect } from "react"
import ErrorBox from "~/app/_components/ErrorBox"
import { useAppStore } from "~/providers/app-store-provider"




const ImportButton = () => {

    const setQrCode = useAppStore((state) => state.setQrCode)

    const myQrcodeDecoder = useAppStore((state) => state.QrcodeDecoder)
    const setQrcodeDecoder = useAppStore((state) => state.setQrcodeDecoder)


    const [openedDropzone, { toggle: toggleDropzone }] = useDisclosure(false)

    const [file, setFile] = useState<FileWithPath | null>(null)

    const fileAccepted = useAppStore((state) => state.fileAccepted)
    const setFileAccepted = useAppStore((state) => state.setFileAccepted)

    const fileRejected = useAppStore((state) => state.fileRejected)
    const setFileRejected = useAppStore((state) => state.setFileRejected)



    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (file && myQrcodeDecoder) {
            // console.log("file", file)
            const imageUrl = URL.createObjectURL(file);
            myQrcodeDecoder.decodeFromImage(imageUrl).then((result) => {
                if (result) {
                    // console.log(result)
                    setQrCode(result.data)
                    toggleDropzone()
                    setFileAccepted(false)
                    setFile(null)
                    setFileRejected("")


                } else {
                    // console.log("no result")
                    setFileAccepted(false)
                    setFile(null)
                }
            }).catch((_err) => {
                // console.log(err)
            })


        }

        return () => {
            setFileAccepted(false)
            setFileRejected("")
            setFile(null)

        }


    }, [file])


    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!myQrcodeDecoder) {
            const myQrcodeDecoder = new QrcodeDecoder()

            setQrcodeDecoder(myQrcodeDecoder)
        }
        return () => {
            setQrcodeDecoder(null)
        }
    }, [])


    return (
        <>
            <Button
                className="rounded-full bg-white/10 px-8  font-semibold no-underline transition hover:bg-white/20 text-nowrap  flex justify-center self-center"
                onClick={() => {
                    toggleDropzone()
                }}
                fullWidth maw={500}
            >
                Import QR Code from Image

            </Button>
            <Modal
                centered
                opened={openedDropzone}
                onClose={() => {
                    toggleDropzone()
                }}
                withCloseButton={false}
                size="xl"
                radius="md"
                // className='bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white'
                classNames={{
                    body: "bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white",
                }}
            >
                <Dropzone
                    loading={fileAccepted}
                    bd={"0px"}
                    className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white p-10'

                    onDrop={(val) => {
                        if (!val || !val[0]) return console.log("no file")
                        setFileAccepted(true)
                        // console.log(val)
                        setFile(val[0])
                    }}
                    onReject={(files) => {
                        // console.log("rejected files", files)
                        const names = files.map((file) => <Box key={file.file.name}>
                            <Text size="md" c={"#ff0000"} inline>
                                {file.file.name}: {file.errors.map((err, index) => <Text component="span" c={"#ff0000"} inline key={err.code}>{err.code.split("-").join(" ")} {file.errors.length && index < file.errors.length - 1 ? " / " : ""}</Text>)}
                            </Text>
                        </Box>)
                        if (names.length > 1) {
                            return setFileRejected(
                                <Text size="md" c={"#ff0000"} inline>
                                    To many files attached. Only one file is allowed.
                                </Text>
                            )
                        }
                        setFileRejected(names)
                    }}
                    maxSize={5 * 1024 ** 2}
                    // maxSize={1}
                    maxFiles={1}
                    accept={IMAGE_MIME_TYPE}
                >
                    <Group>

                        <Dropzone.Reject >
                            <Group mih={50}>
                                <FontAwesomeIcon icon={faBan} />

                                <div>
                                    <Text size="xl" inline>
                                        Only images are allowed. Max one file.
                                    </Text>
                                    {/* <Text size="sm" c="dimmed" inline mt={7}>
                                                                    Attach Max 1 File (Max 5 MB)
                                                                </Text> */}
                                </div>
                            </Group>
                            {/* <Text fz={13} c={"red"}></Text> */}
                        </Dropzone.Reject >
                        <Dropzone.Accept >
                            <Group mih={50}>
                                <FontAwesomeIcon icon={faCheckSquare} />
                                <Text size="xl" inline c={"green"}> Let Go to Upload </Text>
                            </Group>
                        </Dropzone.Accept>
                        <Dropzone.Idle>
                            <Group mih={50}>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />

                                <div>
                                    <Text size="xl" inline>
                                        Drag image here or click to select file.
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        Attach Max 1 File (Max 5 MB)
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone.Idle>
                        <ErrorBox value={fileRejected} visible={!!fileRejected} />
                    </Group>

                </Dropzone>

            </Modal>
        </>
    )
}

export default ImportButton