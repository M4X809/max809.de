"use client"

import { Box, Center, Combobox, Container, Input, InputBase, Text, Title, useCombobox, type ContainerProps } from "@mantine/core"
import { twMerge } from "tailwind-merge"
import { useAppStore } from "~/providers/app-store-provider"


// import csTimer from "cstimer_module";
import { useMounted } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useCubeStore } from "~/providers/cube-timer-provider";

import { Scrambow } from "scrambow";




const CubeScrambleBox = ({ ...props }: Omit<ContainerProps, "children">) => {
    const isMounted = useMounted()

    const scramble = useCubeStore((state) => state.scramble)
    const setScramble = useCubeStore((state) => state.setScramble)

    const scrambleType = useCubeStore((state) => state.scrambleType)
    const setScrambleType = useCubeStore((state) => state.setScrambleType)

    const newScrambleCounter = useCubeStore((state) => state.newScrambleCounter)
    const increaseNewScrambleCounter = useCubeStore((state) => state.increaseNewScrambleCounter)


    const increaseRefetchCounter = useCubeStore((state) => state.increaseRefetchCounter)




    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const scrambleTypes = [
        { value: "222", label: "2x2x2" },
        { value: "333", label: "3x3x3" },
        { value: "444", label: "4x4x4" },
        { value: "555", label: "5x5x5" },
        { value: "666", label: "6x6x6" },
        { value: "777", label: "7x7x7" },
        // ! 3X3X3 Subsets
        // { value: "2gll", label: "2gll" },
        // { value: "ble", label: "ble" },
        // { value: "cls", label: "cls" },
        // { value: "cmll", label: "cmll" },
        // { value: "cmllsune", label: "cmllsune" },
        // { value: "edges", label: "edges" },
        // { value: "333fm", label: "333fm" },
        // { value: "lccp", label: "lccp" },
        // { value: "ll", label: "ll" },
        // { value: "lsll", label: "lsll" },
        // { value: "lse", label: "lse" },
        // { value: "ru", label: "ru" },
        // { value: "lu", label: "lu" },
        // { value: "rud", label: "rud" },
        // { value: "rul", label: "rul" },
        // { value: "nls", label: "nls" },
        // { value: "pll", label: "pll" },
        // { value: "trizbll", label: "trizbll" },
        // { value: "tsle", label: "tsle" },
        // { value: "wv", label: "wv" },
        // { value: "zbll", label: "zbll" },
        // { value: "zz", label: "zz" },
        // { value: "zzll", label: "zzll" },
        // { value: "zzlsll", label: "zzlsll" },

        // { value: "clock", label: "clock" },
        // { value: "fto", label: "fto" },
        // { value: "minx", label: "minx" },
        // { value: "pyram", label: "pyram" },
        // { value: "skewb", label: "skewb" },
        // { value: "sq1", label: "sq1" },
        // { value: "clockoptimal", label: "clockoptimal" },
    ]


    useEffect(() => {
        if (isMounted) {
            // csTimer.setSeed("250")
        }

    }, [isMounted,])


    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        // console.log("newScrambleCounter", newScrambleCounter, isMounted)
        if (newScrambleCounter > 0 || (newScrambleCounter === 0 && isMounted)) {
            const newScramble = new Scrambow().setType(scrambleType).setSeed().setLength(20).get();
            if (newScramble[0]) {
                setScramble(newScramble[0].scramble_string)
            } else {
                console.warn("Could not generate scramble")
            }
        }
    }, [newScrambleCounter, increaseNewScrambleCounter, isMounted])



    const options = scrambleTypes.map((item) => (
        <Combobox.Option value={item.value} key={item.value} className="bg-[rgba(255,255,255,0.1)]  hover:bg-[rgba(255,255,255,0.12)] text-white mb-1 last:mb-0 ">
            <Text c={"gray"} fz={13} >
                {item.label}
            </Text>
        </Combobox.Option>
    ));

    const hideHeader = useAppStore((state) => state.hideHeader)

    return (
        <Container className={twMerge("max-h-[50%] min-h-[50%]  w-full bg-[rgba(255,255,255,0.1)] rounded-xl", props.className, hideHeader && "opacity-0")} >
            <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                    setScrambleType(val);
                    combobox.closeDropdown();
                    increaseRefetchCounter()
                    increaseNewScrambleCounter()
                }}
            >
                <Combobox.Target>
                    <InputBase
                        styles={{
                            wrapper: {
                                background: "transparent",
                                "--input-bd-focus": "var(--input-bd)",
                            },
                            input: {
                                background: "rgba(0,0,0,0.15)",
                            }
                        }}
                        component="button"
                        className="my-2"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                        onClick={() => combobox.toggleDropdown()}
                    >
                        {scrambleTypes.find((item) => item.value === scrambleType)?.label || <Input.Placeholder>Pick value</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown mah={250} className="overflow-auto bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white border-none">
                    <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
            {!!scramble && <Center maw={"100%"} className="flex flex-col h-[calc(100%-100px)]">
                <Title c={"white"} className="font-mono text-center " >
                    {scramble}
                </Title>
            </Center>
            }

        </Container>
    )
}

export default CubeScrambleBox