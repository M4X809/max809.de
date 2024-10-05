"use client"

import { ActionIcon, CopyButton, Group, Stack, Text, Title } from "@mantine/core"
import { useState } from "react"

import EmojiPicker, { EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react';
import { useMounted } from "@mantine/hooks"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy } from "@fortawesome/pro-duotone-svg-icons"
import { twMerge } from "tailwind-merge"


const ExampleInput = ({ url }: { startEmoji?: string, url: string }) => {
    const [value, setValue] = useState("👑")
    const mounted = useMounted()

    return (
        <Stack justify="center" mt={20} className="flex min-w-[500px]">
            <Title ta={"center"} order={2}>Usage</Title>

            <Group className="min-h-[400px] min-w-[500px] flex-nowrap">
                <Group justify="space-between" className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white rounded-lg p-2 w-1/2 flex-nowrap ">

                    <Text truncate>
                        {`${url}/api/icon/${value}`}
                    </Text>
                    <CopyButton value={`${url}/api/icon/${value}`}>
                        {({ copied, copy }) => (
                            <ActionIcon
                                onClick={copy}
                                className={twMerge("transition-colors duration-500", copied ? "bg-green-800 text-green-200 hover:bg-green-800 hover:text-green-200" : "")}
                            >
                                <FontAwesomeIcon icon={faCopy} />
                            </ActionIcon>
                        )}
                    </CopyButton>

                </Group>



                {mounted && <EmojiPicker
                    theme={Theme.DARK}
                    height={400}
                    suggestedEmojisMode={SuggestionMode.FREQUENT}
                    autoFocusSearch={false}
                    previewConfig={{
                        showPreview: false,
                    }}
                    emojiStyle={EmojiStyle.NATIVE}
                    lazyLoadEmojis={true}
                    onEmojiClick={
                        (emoji) => {
                            // console.log("emoji", emoji.emoji)
                            setValue(`${emoji.emoji}`)
                        }
                    }
                />}
            </Group>



            {/* <TextInput
                className="self-center sm:w-1/2 w-full "
                classNames={{}}

                // w={{ base: "", md: "500px" }}
                value={value}
                onChange={(e) => {
                    checkAndSetValue(e.target.value)
                    // const val = e.target.value
                    // // if (!val.startsWith(`${url}/api/icon/`)) {
                    // //     setValue(`${url}/api/icon/${startEmoji}`)
                    // //     return
                    // // }
                    // const lastChar = val.slice(-1)
                    // console.log("lastChar", lastChar)
                    // const { success: emojiSuccess, data, error: emojiError } = z.string().emoji().safeParse(lastChar)
                    // const { success: slashSuccess, data: slashData, error: slashError } = z.string().regex(/(\/)/).safeParse(lastChar)
                    // console.log("slashData", slashData)




                    // if (emojiError && slashError) {
                    //     setValue(`${url}/api/icon/`)
                    //     console.log("1")
                    //     return
                    // }

                    // if (emojiSuccess && slashError) {
                    //     setValue(`${url}/api/icon/${data}`)
                    //     console.log("3")
                    //     return
                    // }


                    // if (emojiError && slashSuccess) {
                    //     setValue(`${url}/api/icon/`)
                    //     console.log("2")
                    //     return
                    // }


                    // console.log("data", data)




                    // setValue(`${url}/api/icon/${data}`)


                }}
            /> */}
        </Stack>
    )
}

export default ExampleInput