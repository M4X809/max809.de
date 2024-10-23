import { Card, Container, Divider, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { twMerge } from "tailwind-merge";
import { onPageAllowed } from "~/lib/sUtils";
import { api } from "~/trpc/server";
import React from "react";
import { DayPagination, EntryButtons, CreateEntry } from "./ClientFeedComponents";
import { feedSearchParamsCache } from "./feedSearchParams";
import { redirect } from "next/navigation";


export type FeedEntry = {
    date: Date | null;
    id: string;
    createdById: string;
    createdAt: Date;
    type: "entry" | "start" | "end" | "pause";
    streetName: string;
    kmState: string;
    startTime: Date | null;
    endTime: Date | null;
    note?: string | null;
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

    function timeDifference(startTime: string, endTime: string): string {
        // Helper function to convert "hh:mm" to total minutes
        function toMinutes(time: string): number | null {
            const parts = time.split(':');
            if (parts.length !== 2) return null;

            const hours = Number(parts[0]);
            const minutes = Number(parts[1]);

            if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

            return hours * 60 + minutes;
        }

        // Convert both times to minutes
        const startMinutes = toMinutes(startTime);
        const endMinutes = toMinutes(endTime);

        // If either time is invalid, return an error or handle the case
        if (startMinutes === null || endMinutes === null) {
            throw new Error("Invalid time format");
        }

        // Calculate the difference in minutes, handling cases where endTime < startTime (crossing midnight)
        let diffMinutes = endMinutes - startMinutes;
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60; // Add 24 hours' worth of minutes to account for crossing midnight
        }

        // Convert minutes back to "hh:mm" format
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        // Ensure the result is always in "hh:mm" format
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Example usage:
    console.log(timeDifference("23:45", "01:15")); // Output: "01:30"



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
                        <Group justify="space-between" align="start" >
                            <Title order={3} mb={15}>
                                {data?.day.toLocaleString("de-DE", {
                                    weekday: "long",
                                })}
                                {", "}
                                {data?.day.toLocaleDateString()}
                            </Title>
                            <DayPagination />
                        </Group>
                        {startTime && <Stack gap={1}>
                            <Group className="justify-between ">
                                <Title order={4}>
                                    Arbeitsbeginn
                                </Title>
                                <EntryButtons id={startTime.id} />
                            </Group>
                            <Group className="justify-between md:justify-start">
                                <Text fz={15}  >
                                    Uhrzeit: {startTime.startTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
                                </Text>
                                <Text fz={15} >
                                    Kilometerstand: {Number.parseInt(startTime.kmState, 10).toLocaleString("de-DE", {
                                    })} km
                                </Text>
                            </Group>
                            {!!startTime?.note &&
                                <Stack gap={3}>
                                    <Text fz={15}>
                                        Notiz:
                                    </Text>
                                    <Textarea


                                        readOnly
                                        fz={15}
                                        autosize
                                        minRows={1}
                                        maxRows={4}
                                        value={startTime.note}
                                        classNames={{
                                            input: "focus-within:outline-none focus-within:border-transparent border-transparent cursor-default"
                                        }}
                                        className="w-full " />

                                </Stack>
                            }

                            {entries.length > 0 && <Divider my={10} />}
                        </Stack>}
                        {entries.length > 0 && entries.map((entry, index) => {
                            // console.log("entry", entry)

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
                                                Differenz: {kmDifference.toLocaleString("de-DE", {
                                                })} km
                                            </Text>}
                                        </Group>
                                        {!!entry?.note &&
                                            <Stack gap={3}>
                                                <Text fz={15}>
                                                    Notiz:
                                                </Text>
                                                <Textarea


                                                    readOnly
                                                    fz={15}
                                                    autosize
                                                    minRows={1}
                                                    maxRows={4}
                                                    value={entry.note}
                                                    classNames={{
                                                        input: "focus-within:outline-none focus-within:border-transparent border-transparent cursor-default"
                                                    }}
                                                    className="w-full " />

                                            </Stack>
                                        }
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
                                        {!!entry?.note &&
                                            <Stack gap={3}>
                                                <Text fz={15}>
                                                    Notiz:
                                                </Text>
                                                <Textarea


                                                    readOnly
                                                    fz={15}
                                                    autosize
                                                    minRows={1}
                                                    maxRows={4}
                                                    value={entry.note}
                                                    classNames={{
                                                        input: "focus-within:outline-none focus-within:border-transparent border-transparent cursor-default"
                                                    }}
                                                    className="w-full " />

                                            </Stack>
                                        }
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
                                            Arbeitsende
                                        </Title>
                                        <EntryButtons id={endTime.id} />
                                    </Group>
                                    <Group
                                        className="justify-between md:justify-start"
                                    >

                                        <Text fz={15}>
                                            Uhrzeit: {endTime.endTime?.toLocaleTimeString().split(":").slice(0, 2).join(":")}
                                        </Text>
                                        {!!startTime?.startTime && !!endTime?.endTime && <Text fz={15}>
                                            Arbeitszeit: {timeDifference(
                                                startTime!.startTime?.toLocaleTimeString("de-DE").split(":").slice(0, 2).join(":"),
                                                endTime!.endTime?.toLocaleTimeString("de-DE").split(":").slice(0, 2).join(":"),
                                            )}
                                        </Text>}
                                    </Group>
                                    <Group
                                        className="justify-between md:justify-start"
                                    >
                                        <Text fz={15}>
                                            Kilometerstand: {Number.parseInt(endTime.kmState, 10).toLocaleString("de-DE", {
                                            })} km
                                        </Text>
                                        <Text fz={15}>
                                            Tages-Differenz: {endDifference()} km
                                        </Text>
                                    </Group>
                                    {!!endTime?.note &&
                                        <Stack gap={3}>
                                            <Text fz={15}>
                                                Notiz:
                                            </Text>
                                            <Textarea


                                                readOnly
                                                fz={15}
                                                autosize
                                                minRows={1}
                                                maxRows={4}
                                                value={endTime.note}
                                                classNames={{
                                                    input: "focus-within:outline-none focus-within:border-transparent border-transparent cursor-default"
                                                }}
                                                className="w-full " />

                                        </Stack>
                                    }
                                </Stack>
                            </React.Fragment>
                        }
                    </Stack>
                </Card>
            </Stack>
        </Container>
    )
}
