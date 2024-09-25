"use client"

import { Center, Container, type ContainerProps, Overlay, Stack, Text } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { twMerge } from "tailwind-merge"
import { useAppStore } from "~/providers/app-store-provider"

const CubeTimerStats = ({ ...props }: Omit<ContainerProps, "children">) => {
    const hideHeader = useAppStore((state) => state.hideHeader)
    const { width, height, ref } = useElementSize()
    // console.log("width", width)

    if (width < 350) {
        return (
            // <Overlay blur={2} >
            <Container ref={ref} className={twMerge("max-h-[50%] h-full  w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0")} >
                <Center className="h-full w-full">
                    <Text fz={25} ta={"center"} fw={500} c={"white"} >
                        Screen too small!
                    </Text>
                </Center>
            </Container>
            // {/* </Overlay> */ }
        )

    }


    return (
        <Container ref={ref} className={twMerge("max-h-[50%]   w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0", width < 350 && "h-full")} >
            {width > 350 &&
                <>
                    <div>CubeTimerStats</div>
                    {Array.from({ length: 100 }).map((_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <Text key={index + 1}>
                            {index + 1}
                        </Text>
                    ))}
                </>
            }
            {width < 350 &&
                <Center className="h-full w-full">
                    <Stack>


                        <Text fz={25} ta={"center"} fw={500} c={"white"} >
                            Screen too small!
                        </Text>
                        {/* <br /> */}
                        <Text ta={"center"} c={"white"} fz={13} >
                            You need more space to see the Stats.
                        </Text>

                    </Stack>
                </Center>}
        </Container>
    )
}

export default CubeTimerStats