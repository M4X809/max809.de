"use client"

import { Center, Container, type ContainerProps, Stack, Text, Title } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import type { Session } from "next-auth"
import { twMerge } from "tailwind-merge"
import { AuthButton } from "~/app/_components/AuthButton"
import { useAppStore } from "~/providers/app-store-provider"

const CubeTimerStats = ({ session, ...props }: Omit<ContainerProps, "children"> & { session: Session | null | undefined }) => {
    const hideHeader = useAppStore((state) => state.hideHeader)
    const { width, ref } = useElementSize()
    // console.log("width", width)

    if (!session?.user.id) return (
        <Container ref={ref} className={twMerge("max-h-[50%] h-full  w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0")} >
            <Center className="h-full w-full">
                <Stack>
                    <Title order={4}>Sign in to see your Statistics.</Title>
                    <AuthButton session={session} onlySignIn />
                </Stack>
            </Center>
        </Container>
    )

    if (width < 350) {
        return (
            <Container ref={ref} className={twMerge("max-h-[50%] h-full  w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0")} >
                <Center className="h-full w-full">
                    <Text fz={25} ta={"center"} fw={500} c={"white"} >
                        Screen too small!
                    </Text>
                </Center>
            </Container>
        )
    }

    return (
        <Container ref={ref} className={twMerge("max-h-[50%] h-full  w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0", width < 350 && "h-full")} >
            {width > 350 &&
                <Center className="h-full w-full">
                    <Stack>
                        <Title ta={"center"} order={4}>Cube Time Stats</Title>
                        <Text ta={"center"} fz={13} c={"dimmed"} >
                            Not implemented yet.
                        </Text>
                    </Stack>
                </Center>
            }
        </Container>
    )
}

export default CubeTimerStats