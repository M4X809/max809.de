import { Box, Card, Container, Divider, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { twMerge } from "tailwind-merge";
import CreateEntry from "./CreateEntry";
import { onPageAllowed } from "~/lib/sUtils";
import { api } from "~/trpc/server";
import { TRPCError } from "@trpc/server";
import React from "react";



export default async function LogbookFeed() {
    await onPageAllowed("viewLogbookFeed")
    let data: {
        streetNames: string[];
        startTime: {
            date: Date | null;
            id: string;
            createdById: string;
            createdAt: Date;
            type: "entry" | "start" | "end" | "pause";
            streetName: string;
            kmState: string;
            startTime: Date | null;
            endTime: Date | null;
        } | undefined;
        endTime: {
            date: Date | null;
            id: string;
            createdById: string;
            createdAt: Date;
            type: "entry" | "start" | "end" | "pause";
            streetName: string;
            kmState: string;
            startTime: Date | null;
            endTime: Date | null;
        } | undefined;
        entries: {
            date: Date | null;
            id: string;
            createdById: string;
            createdAt: Date;
            type: "entry" | "start" | "end" | "pause";
            streetName: string;
            kmState: string;
            startTime: Date | null;
            endTime: Date | null;
        }[]
        day: Date

    } | undefined = undefined

    try {
        data = await api.logbook.getEntries({ day: new Date().toLocaleDateString() })
    } catch (err) {

        console.log("err", err)
        return <div>Error</div>



    }
    // console.log("entries", data)




    const startTime = data?.startTime
    const endTime = data?.endTime
    const entries = data?.entries
    const streetNames = data?.streetNames


    const endDifference = () => {
        if (!endTime || !startTime || !entries) return
        const startKmState = Number.parseInt(startTime.kmState, 10);
        const endKmState = Number.parseInt(endTime.kmState, 10);
        const kmDifference = endKmState - startKmState;
        return kmDifference.toLocaleString("de-DE", {})


    }






    const cardClassName = "bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg"
    return (
        <Container size={"lg"}>
            <Stack>
                <Card
                    className={twMerge(cardClassName)}
                >
                    <CreateEntry
                        streetNames={streetNames}
                    />
                </Card>

                <Card
                    className={twMerge(cardClassName)}
                    p={"sm"}
                    withBorder
                    radius={"md"}
                >

                    <Stack gap={4}>

                        <Title order={2}>
                            {/* weekday (Montag -> Freitag) */}
                            {data?.day.toLocaleString("de-DE", {
                                weekday: "long",
                            })}
                            {" "}
                            {data?.day.toLocaleDateString()}
                        </Title>



                        {startTime && <Stack gap={1}>
                            <Title order={4}>
                                Arbeits Begin
                            </Title>
                            <Group className="justify-between md:justify-start">
                                <Text fz={15}  >
                                    Uhrzeit: {startTime.startTime?.toLocaleTimeString()}
                                </Text>
                                <Text fz={15} >
                                    Kilometer Stand: {Number.parseInt(startTime.kmState, 10).toLocaleString("de-DE", {
                                    })} km
                                </Text>
                            </Group>

                            {entries.length > 0 && <Divider my={10} />}
                        </Stack>}

                        {entries.length > 0 && entries.map((entry, index) => {
                            const prevEntry = entries[index - 1] ?? startTime; // Get the previous entry
                            const currentKmState = Number.parseInt(entry.kmState, 10);
                            const prevKmState = prevEntry ? Number.parseInt(prevEntry.kmState, 10) : null;
                            const kmDifference = prevKmState !== null ? currentKmState - prevKmState : null;




                            if (entry.type === "pause") return (

                                <React.Fragment key={entry.id}>

                                    <Stack key={entry.id} gap={1}>
                                        <Title order={4}>
                                            Pause
                                        </Title>
                                        <Group className="justify-between md:justify-start">
                                            <Text fz={15} >
                                                Von: {entry.startTime?.toLocaleTimeString()}
                                            </Text>
                                            <Text fz={15}  >
                                                Bis: {entry.endTime?.toLocaleTimeString()}
                                            </Text>
                                        </Group>
                                        <Group className="justify-between md:justify-start">

                                            <Text fz={15} >
                                                Kilometerstand: {Number.parseInt(entry.kmState, 10).toLocaleString("de-DE", {
                                                })} km
                                            </Text>
                                            {kmDifference !== null && <Text fz={15} >
                                                Differenz  : {kmDifference.toLocaleString("de-DE", {
                                                })} km
                                            </Text>}


                                        </Group>


                                    </Stack>
                                    {index < entries.length - 1 &&
                                        <Divider my={10} />
                                    }
                                </React.Fragment>
                            )


                            if (entry.type === "entry") return (
                                <React.Fragment key={entry.id}>
                                    <Stack key={entry.id} gap={1}>
                                        <Title order={4}>
                                            Straße: {entry.streetName}
                                        </Title>
                                        <Group className="justify-between md:justify-start">
                                            <Text fz={15}  >
                                                Von: {entry.startTime?.toLocaleTimeString()}
                                            </Text>
                                            <Text fz={15}  >
                                                Bis: {entry.endTime?.toLocaleTimeString()}
                                            </Text>
                                        </Group>
                                        <Group className="justify-between md:justify-start">
                                            {/* <Text fz={15} >
                                                Straße: {entry.streetName}
                                            </Text> */}
                                            <Text fz={15} >
                                                Kilometerstand: {Number.parseInt(entry.kmState, 10).toLocaleString("de-DE", {
                                                })} km
                                            </Text>
                                            {kmDifference !== null && <Text fz={15} >
                                                Differenz  : {kmDifference.toLocaleString("de-DE", {
                                                })} km
                                            </Text>}
                                        </Group>
                                    </Stack>
                                    {index < entries.length - 1 &&
                                        <Divider my={10} />
                                    }

                                </React.Fragment>
                            )

                            return null
                        })}
                        {endTime &&
                            <React.Fragment>
                                {entries.length > 0 && <Divider my={10} />}

                                <Stack gap={1}>
                                    <Title order={4}>
                                        Arbeits Ende
                                    </Title>
                                    <Group
                                        className="justify-between md:justify-start"
                                    >

                                        <Text fz={15}  >
                                            Uhrzeit: {endTime.endTime?.toLocaleTimeString()}
                                        </Text>
                                    </Group>
                                    <Group
                                        className="justify-between md:justify-start"

                                    >
                                        <Text fz={15}  >
                                            Kilometer Stand: {Number.parseInt(endTime.kmState, 10).toLocaleString("de-DE", {
                                            })} km
                                        </Text>
                                        <Text fz={15} >
                                            Tages Differenz  : {endDifference()} km
                                        </Text>
                                    </Group>

                                    {/* <Divider my={10} /> */}
                                </Stack>
                            </React.Fragment>
                        }



                    </Stack>








                </Card>







            </Stack>



        </Container>
    )
}
