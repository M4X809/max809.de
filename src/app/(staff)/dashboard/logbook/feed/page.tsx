import { Card, Container, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { twMerge } from "tailwind-merge";
import { onPageAllowed } from "~/lib/sUtils";
import { api } from "~/trpc/server";
import React from "react";
import { DayPagination, EntryButtons, CreateEntry } from "./ClientFeedComponents";
import { feedSearchParamsCache } from "./feedSearchParams";
import { redirect } from "next/navigation";


type FeedEntry = {
    date: Date | null;
    id: string;
    createdById: string;
    createdAt: Date;
    type: "entry" | "start" | "end" | "pause";
    streetName: string;
    kmState: string;
    startTime: Date | null;
    endTime: Date | null;
}

export type FeedData = {
    streetNames: string[];
    startTime: FeedEntry | undefined;
    endTime: FeedEntry | undefined;
    entries: FeedEntry[]
    day: Date
} | undefined

export default async function LogbookFeed({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    await onPageAllowed("viewLogbookFeed")
    let data: FeedData = undefined

    const { day } = feedSearchParamsCache.parse(searchParams)

    try {
        data = await api.logbook.getEntries({ day: day.includes("Invalid") ? new Date().toLocaleDateString("de-DE") : day })
    } catch (err) {
        redirect("/dashboard/logbook/feed")
    }

    const startTime = data?.startTime
    const endTime = data?.endTime
    const entries = data?.entries
    const streetNames = data?.streetNames

    const endDifference = () => {
        if (!endTime || !startTime || !entries) return
        const startKmState = Number.parseInt(startTime.kmState, 10);
        const endKmState = Number.parseInt(endTime.kmState, 10);
        const kmDifference = endKmState - startKmState;
        return kmDifference.toLocaleString("de-DE")
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
                        <Group justify="space-between" >
                            <Title order={3}>
                                {data?.day.toLocaleString("de-DE", {
                                    weekday: "long",
                                })}
                                {" "}
                                {data?.day.toLocaleDateString()}
                            </Title>
                            <DayPagination />
                        </Group>
                        {startTime && <Stack gap={1}>
                            <Group className="justify-between ">
                                <Title order={4}>
                                    Arbeits Begin
                                </Title>
                                <EntryButtons id={startTime.id} />
                            </Group>
                            <Group className="justify-between md:justify-start">
                                <Text fz={15}  >
                                    Uhrzeit: {startTime.startTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
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
                                        <Group className="justify-between ">
                                            <Title order={4}>
                                                Pause
                                            </Title>
                                            <EntryButtons id={entry.id} />
                                        </Group>
                                        <Group className="justify-between md:justify-start">
                                            <Text fz={15} >
                                                Von: {entry.startTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
                                            </Text>
                                            <Text fz={15}  >
                                                Bis: {entry.endTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
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
                                        <Group className="justify-between ">
                                            <Title order={4}>
                                                Straße: {entry.streetName || "Keine Straße angegeben"}
                                            </Title>
                                            <EntryButtons id={entry.id} />
                                        </Group>
                                        <Group className="justify-between md:justify-start">
                                            <Text fz={15}  >
                                                Von: {entry.startTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
                                            </Text>
                                            <Text fz={15}  >
                                                Bis: {entry.endTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
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
                            return null
                        })}
                        {endTime &&
                            <React.Fragment>
                                {entries.length > 0 && <Divider my={10} />}
                                <Stack gap={1}>
                                    <Group className="justify-between ">
                                        <Title order={4}>
                                            Arbeits Ende
                                        </Title>
                                        <EntryButtons id={endTime.id} />
                                    </Group>
                                    <Group
                                        className="justify-between md:justify-start"
                                    >

                                        <Text fz={15}>
                                            Uhrzeit: {endTime.endTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
                                        </Text>
                                    </Group>
                                    <Group
                                        className="justify-between md:justify-start"
                                    >
                                        <Text fz={15}>
                                            Kilometer Stand: {Number.parseInt(endTime.kmState, 10).toLocaleString("de-DE", {
                                            })} km
                                        </Text>
                                        <Text fz={15}>
                                            Tages Differenz  : {endDifference()} km
                                        </Text>
                                    </Group>
                                </Stack>
                            </React.Fragment>
                        }
                    </Stack>
                </Card>
            </Stack>
        </Container>
    )
}
