"use client"

import { useEffect, useState } from "react";
import { useHotkeys, isHotkeyPressed } from "react-hotkeys-hook";
import { Box, Button, Center, type CenterProps, Group, Stack, Text, Title } from "@mantine/core"
import { useMounted } from "@mantine/hooks";

import { useCubeStore } from "~/providers/cube-timer-provider"
import { useTimer, TimerRenderer } from 'react-use-precision-timer';

import { useAppStore } from "~/providers/app-store-provider";
import { api } from '~/trpc/react'
import { formatTime } from "~/lib/cUtils";
import { modals } from "@mantine/modals";

import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { twMerge } from "tailwind-merge";

export const MainTimer = ({ session, ...props }: Omit<CenterProps, "children"> & { session: Session | null | undefined }) => {

    const router = useRouter()
    const { mutate, isPending, isSuccess } = api.cube.createCubeTime.useMutation()

    const setHideHeader = useAppStore((state) => state.setHideHeader)
    const os = useAppStore((state) => state.os)
    const timer = useCubeStore((state) => state.timer())
    const setPage = useCubeStore((state) => state.setPage)

    const [holding, setHolding] = useState(false);
    const [runTimerFinished, setRunTimerFinished] = useState(false);
    const [finishedLetGo, setFinishedLetGo] = useState(true);
    const [renderRate] = useState<number>(100);
    const increaseRefetchCounter = useCubeStore((state) => state.increaseRefetchCounter)
    const scrambleType = useCubeStore((state) => state.scrambleType)
    const scramble = useCubeStore((state) => state.scramble)
    const increaseNewScrambleCounter = useCubeStore((state) => state.increaseNewScrambleCounter)
    const [endTime, setEndTime] = useState(0);
    const isMounted = useMounted();

    const runTimer = useTimer({ delay: 500, runOnce: true }, () => {
        setRunTimerFinished(true)
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setHideHeader(timer.isRunning())

    }, [timer.isRunning(),])
    useEffect(() => {
        if (isSuccess) {
            setPage(1)
            increaseRefetchCounter()
            increaseNewScrambleCounter()
        }
    }, [isSuccess, setPage, increaseRefetchCounter, increaseNewScrambleCounter])

    useHotkeys('space', (_e, _handler) => {

        if (isHotkeyPressed("space") && !holding && !timer.isRunning() && finishedLetGo) {
            setHolding(true)
            setFinishedLetGo(false)
            runTimer.start()
            return
        }
        if (!isHotkeyPressed("space") && holding) {
            if (runTimerFinished && !timer.isRunning()) {
                timer.start()
                setHolding(false)
                setRunTimerFinished(false)
                return
            }
            if (!runTimerFinished && timer.isRunning()) {
                timer.pause()
                setEndTime(timer.getElapsedRunningTime())
                timer.stop()

                return
            }
        }
        if (timer.isRunning() && isHotkeyPressed("space")) {
            timer.pause()
            const elapsedTime = timer.getElapsedRunningTime()
            setEndTime(elapsedTime)
            if (session?.user.id) {
                mutate({
                    cubeSize: scrambleType,
                    scramble: scramble,
                    time: elapsedTime,
                })
            }
            timer.stop()

            return
        }

        if (!isHotkeyPressed("space") && timer.isStopped() && !finishedLetGo) {
            setHolding(false)
            setRunTimerFinished(false)
            setFinishedLetGo(true)
            runTimer.stop()
            return
        }

    }, { keydown: true, preventDefault: true, keyup: true, },
        [holding, finishedLetGo, runTimerFinished, timer, isHotkeyPressed, setHolding, setRunTimerFinished, setFinishedLetGo, setEndTime, mutate, endTime]

    )

    const counterDisplay = (type: "timeColor" | "hintText") => {
        if (type === "timeColor") {
            switch (true) {
                case timer.isRunning():
                    return "green"
                case holding && runTimerFinished:
                    return "yellow"
                case holding && !runTimerFinished:
                    return "red"
                case isHotkeyPressed("space") && !finishedLetGo:
                    return "yellow"
                default:
                    return "white"
            }
        }
        if (type === "hintText") {
            switch (true) {
                case timer.isRunning():
                    return "Press Space to Stop!"
                case holding && runTimerFinished:
                    return "Let Go"
                case holding && !runTimerFinished:
                    return "Wait"
                case isHotkeyPressed("space") && !finishedLetGo:
                    return "Let Go"
                default:
                    return "Hold Space to Start"
            }
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (os === "undetermined") return
        if ((os === "android" || os === "ios") && isMounted) {
            console.log("os", os)
            router.prefetch("/")
            modals.open({
                overlayProps: {
                    blur: 2,
                },
                id: "os-warning",
                title: "Warning",
                centered: true,
                radius: "xl",
                styles: { header: { background: "rgba(0,0,0,0.5)", color: "white" }, body: { background: "rgba(0,0,0,0.5)" } },
                color: "white",
                children: (
                    <Box>
                        <Text c={"white"}>
                            Caution - This app is not supported on mobile devices. Please use a desktop computer for the best experience.
                        </Text>
                        <Group className="w-full justify-evenly pt-5 ">
                            <Button
                                size="compact-sm"
                                variant="gradient"
                                gradient={{ from: "red", to: "orange" }}
                                onClick={() => {
                                    modals.closeAll()
                                }}

                            >
                                Continue anyway.
                            </Button>
                            <Button
                                size="compact-sm"
                                // component={Link}
                                // href={"/"}
                                // prefetch
                                onClick={() => {
                                    modals.closeAll()
                                    router.prefetch("/")
                                    router.push("/")
                                }}
                            >
                                Return to Homepage
                            </Button>

                        </Group>

                    </Box>
                ),



                // labels: { confirm: "Continue anyway", cancel: "Return to Homepage" },
            })


        }

        return () => {
            modals.close("os-warning")
        }



    }, [os, isMounted])

    return (
        <Center className={twMerge(" w-full  flex-grow", props.className)} >


            <Stack >
                {timer.isRunning() &&
                    <TimerRenderer
                        timer={timer}
                        renderRate={renderRate}
                        render={(t) => (
                            // <Badge bg={t.isStarted() ? 'success' : 'danger'} className="font-monospace">
                            // </Badge>
                            <Title ta={"center"}
                                fz={80}
                                fw={500}
                                c={counterDisplay("timeColor")}
                                // className={"lcdFont.className"}
                                style={{
                                    fontFamily: "lcd-2",
                                }}
                            >
                                {/* {`${(t.getElapsedRunningTime() / 1000).toFixed(1)}`} */}
                                {formatTime(t.getElapsedRunningTime())}
                            </Title>
                        )}
                    />}
                {(timer.isPaused() || timer.isStopped()) &&
                    <Title
                        style={{
                            fontFamily: "lcd-2",
                        }}
                        // className={lcdFont.className}
                        ta={"center"}
                        c={counterDisplay("timeColor")}
                        fz={80}
                        // size={80} 
                        fw={500}
                    >
                        {/* {`${(endTime / 1000).toFixed(3).padStart(6, "0")}`} */}
                        {formatTime(endTime)}
                    </Title>
                }
                <Text ta={"center"} >
                    {counterDisplay("hintText")}
                </Text>
                <Text ta={"center"} className={twMerge("text-red-500 text-opacity-50 text-sm transition-opacity duration-250", !isPending && "opacity-0 animate-bounce")} >

                    Saving

                </Text>
                {/* <Button tabIndex={-1} onClick={() => timer.start()}>
                    Start
                </Button>
                <Button tabIndex={-1} onClick={() => { timer.pause(); setEndTime(timer.getElapsedRunningTime()); timer.stop(); }}>
                    End
                </Button> */}
            </Stack>


        </Center>
    )
}