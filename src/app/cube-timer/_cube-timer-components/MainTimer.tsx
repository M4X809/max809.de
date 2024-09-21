"use client"

import { Badge, Box, Button, Center, Group, NumberInput, Stack, Text, Title } from "@mantine/core"

import { useCubeStore } from "~/providers/cube-timer-provider"
import { useTimer, useStopwatch, TimerRenderer } from 'react-use-precision-timer';

import { lcdFont } from "~/app/cube-timer/layout"
import { useCallback, useEffect, useMemo, useState } from "react";

import { useHotkeys, isHotkeyPressed } from "react-hotkeys-hook";
import { Key } from 'ts-key-enum'
import { useAppStore } from "~/providers/app-store-provider";
export const MainTimer = () => {

    // The callback will be called every 1000 milliseconds.
    // const timer = useStopwatch();
    const setHideHeader = useAppStore((state) => state.setHideHeader)
    const timer = useCubeStore((state) => state.timer())

    const [holding, setHolding] = useState(false);
    const [runTimerFinished, setRunTimerFinished] = useState(false);
    const [finishedLetGo, setFinishedLetGo] = useState(true);
    const [renderRate, setRenderRate] = useState(10);

    const [endTime, setEndTime] = useState(0);



    const runTimer = useTimer({ delay: 500, runOnce: true }, () => {
        // console.log("runTimer finished")
        setRunTimerFinished(true)
    }
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setHideHeader(timer.isRunning())
        // console.log("timer.isRunning()", timer.isRunning())

    }, [timer.isRunning(),])





    // const spacePressed = isHotkeyPressed("space");

    // useEffect(() => {
    //     if (spacePressed) {
    //         timer.start();
    //     }
    // }, [spacePressed, timer]);

    useHotkeys('space', (e, handler) => {

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
            setEndTime(timer.getElapsedRunningTime())
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
        [holding, finishedLetGo, runTimerFinished, timer, isHotkeyPressed, setHolding, setRunTimerFinished, setFinishedLetGo, setEndTime]

    )


    // const [delay, setDelay] = useState(1000);
    // const [startTimeEnabled, setStartTimeEnabled] = useState(false);
    // const [startTime, setStartTime] = useState(Date.now());
    // // const [startImmediately, setStartImmediately] = useState(true);
    // const [delayChanged, setDelayChanged] = useState(false);


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





    return (
        <Center className="h-[calc(100dvh-100px)] w-full">


            <Stack w={500}>
                {timer.isRunning() &&
                    <TimerRenderer
                        timer={timer}
                        renderRate={renderRate}
                        render={(t) => (
                            // <Badge bg={t.isStarted() ? 'success' : 'danger'} className="font-monospace">
                            // </Badge>
                            <Title ta={"center"} w={500} size={80} fw={500}
                                c={counterDisplay("timeColor")}
                                // className={"lcdFont.className"}
                                style={{
                                    fontFamily: "lcd-2",
                                }}
                            >
                                {`${(t.getElapsedRunningTime() / 1000).toFixed(3)}`}
                            </Title>
                        )}
                    />}
                {(timer.isPaused() || timer.isStopped()) && <Title
                    style={{
                        fontFamily: "lcd-2",
                    }}
                    className={lcdFont.className}
                    ta={"center"} w={500}
                    c={counterDisplay("timeColor")}
                    size={80} fw={500}
                >
                    {`${(endTime / 1000).toFixed(3)}`}
                </Title>
                }
                <Text ta={"center"} w={500} >
                    {counterDisplay("hintText")}
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