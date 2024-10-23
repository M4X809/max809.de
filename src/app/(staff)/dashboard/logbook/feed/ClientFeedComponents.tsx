"use client"
import { faCalendarAlt, faChevronLeft, faChevronRight, faEdit, faTrashCan } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Autocomplete, Box, Button, Center, Group, Modal, Select, Switch, Text, Textarea, TextInput, VisuallyHidden } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from 'react'
import { api } from '~/trpc/react'
import { feedSearchParamsParser } from './feedSearchParams'
import { DateInput, DatePicker, TimeInput } from '@mantine/dates'
import { useDebouncedCallback } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { DismissButton } from '~/components/ui/sonner'
import type { FeedEntry } from './page'
import Link from 'next/link'
import { z } from 'zod'


export const DayPagination = () => {
    const router = useRouter()
    const [day, setDay] = useQueryState('day', feedSearchParamsParser.day)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [day2, month, year] = day.split(".").map(Number);
    // console.log("day", day)
    // console.log("day2", day2)
    // console.log("month", month)
    // console.log("year", year)

    useEffect(() => {
        if (!day) return
        if (day.includes("Invalid")) setDay(new Date().toLocaleDateString("de-DE"))
    }, [day, setDay])



    const [datePickerState, setDatePickerState] = useState<Date | undefined | null>(new Date(year!, month! - 1, day2))
    const callbackInput = useDebouncedCallback((date: Date | undefined | null) => {
        if (!date) return
        setDay(date.toLocaleDateString("de-DE"))
        setTimeout(() => {
            router.refresh()
        }, 100)
    }, 0)

    const callbackPagination = useDebouncedCallback((dateString: string) => {
        if (!dateString) return
        setDay(dateString)
        setTimeout(() => {
            router.refresh()
        }, 10)
    }, 100)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (datePickerOpen) {
            setDatePickerState(new Date(year!, month! - 1, day2))
        }
    }, [datePickerOpen])

    return (
        <>
            <Modal
                centered
                opened={datePickerOpen}
                onClose={() => {
                    setDatePickerOpen(false)
                }}
                withCloseButton={false}
                bg={"transparent"}
                classNames={{
                    overlay: "bg-[rgba(0,0,0,0.3)] ",
                    body: "bg-transparent",
                    inner: "bg-transparent",
                    root: "bg-transparent",
                    content: " bg-[rgba(0,0,0,0.25)] backdrop-blur-2xl rounded-md",
                }}
            >
                <Center>
                    <DatePicker
                        locale='de'
                        value={datePickerState}
                        onChange={(date) => {
                            setDatePickerState(date)
                            callbackInput(date)
                            setDatePickerOpen(false)
                        }}
                    />
                </Center>
            </Modal>
            <Group wrap='nowrap' gap={5}>
                <ActionIcon
                    className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
                    onClick={() => {
                        const previousDay = new Date(year!, month! - 1, day2! - 1).toLocaleDateString("de-DE")
                        console.log("previousDay", previousDay)
                        callbackPagination(previousDay)
                    }}
                >
                    <VisuallyHidden>Previous Day</VisuallyHidden>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </ActionIcon>
                <ActionIcon
                    className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
                    onClick={() => {
                        const nextDay = new Date(year!, month! - 1, day2! + 1).toLocaleDateString("de-DE")
                        console.log("nextDay", nextDay)
                        callbackPagination(nextDay)
                    }}
                >
                    <VisuallyHidden>Next Day</VisuallyHidden>
                    <FontAwesomeIcon icon={faChevronRight} />
                </ActionIcon>
                <ActionIcon
                    className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
                    onClick={() => {
                        setDatePickerOpen(true)
                    }}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} />
                </ActionIcon>
            </Group>
        </>
    )
}

export const EntryButtons = ({ id }: { id: string }) => {
    return (
        <ActionIcon
            variant='filled'
            className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
            component={Link}
            href={`/dashboard/logbook/feed/${id}`}
            prefetch={false}
        >
            <FontAwesomeIcon icon={faEdit} />
        </ActionIcon>
    )
}



export const CreateEntry = ({ streetNames, initialValues, entryId }: { streetNames: string[], initialValues?: FeedEntry | undefined | null, entryId?: string | undefined | null }) => {
    const router = useRouter()
    const { mutate: createEntry, isPending: isCreating, isSuccess: isCreated, error: createError } = api.logbook.createEntry.useMutation()
    const { mutate: updateEntry, isPending: isUpdating, isSuccess: isUpdated, error: updateError } = api.logbook.updateEntry.useMutation()

    const [_day, setDay] = useQueryState('day', feedSearchParamsParser.day)



    const form = useForm({
        mode: 'controlled',
        initialValues: {
            type: initialValues?.type ?? "entry" as "start" | "end" | "pause" | "entry",
            streetName: initialValues?.streetName ?? "",
            kmState: initialValues?.kmState ?? "",
            startTime: initialValues?.startTime?.toLocaleTimeString() ?? "",
            endTime: initialValues?.endTime?.toLocaleTimeString() ?? "",
            date: initialValues?.date ?? new Date(),
            note: initialValues?.note ?? "",
            unpaidBreak: initialValues?.unpaidBreak ?? false,
        },
        validateInputOnChange: true,
        validateInputOnBlur: true,

        validate: {
            streetName: (value) => {
                const isEntry = form.values.type === "entry"
                if (!isEntry) return false


                return value.length > 0 ? false : 'Der Name darf nicht leer sein.'
            },
            kmState: (value) => {
                const { error, data, success } = z.string().regex(/^[0-9]+$/im).safeParse(value)

                if (error) return "Der Kilometerstand muss eine Zahl sein und darf nicht leer sein."
                return false
            },
        },
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (isCreated || isUpdated) {

            if (isUpdated) {
                console.log("isUpdated", isUpdated)
                // router.push("/dashboard/logbook/feed")
                router.push(`/dashboard/logbook/feed?day=${initialValues?.date?.toLocaleDateString("de-DE")}`)

                setTimeout(() => {
                    router.refresh()
                }, 100)

                return
            }

            const type = form.values.type
            const date = form.values.date
            form.reset()
            form.setValues({
                type: type === "pause" ? "entry" : type,
                date: date,
            })
            setDay(date.toLocaleDateString("de-DE"))
            setTimeout(() => {
                router.refresh()
            }, 100)

        }

        if (createError || updateError) {
            toast.error("Fehler beim Erstellen des Eintrags.", {
                id: "creating-error",
                cancel: <DismissButton id="creating-error" />,
                description: (
                    <Box>
                        {createError?.message ?? updateError?.message}
                    </Box>
                ),
            })
        }
    }, [isCreated, form.reset, router, createError, form.setValues, updateError, isUpdating, isUpdated])


    // useEffect(() => {
    //     return () => {
    //         router.refresh()
    //     }


    // }, [router])



    return (
        <form onSubmit={form.onSubmit((values) => {
            const date = new Date(values.date)
            const startTimeString = values.startTime.toString()
            const endTimeString = values.endTime.toString()
            let startDate: Date | undefined = undefined
            let endDate: Date | undefined = undefined

            const [startHours, startMinutes] = startTimeString.split(':').map(Number);
            const [endHours, endMinutes] = endTimeString.split(':').map(Number);

            if (values.startTime) {
                const _startDate = new Date(date)
                _startDate.setHours(startHours!, startMinutes, 0, 0)
                startDate = _startDate
            }

            if (values.endTime) {
                const _endDate = new Date(date)
                _endDate.setHours(endHours!, endMinutes, 0, 0)
                endDate = _endDate
            }

            if (entryId) {
                updateEntry({
                    id: entryId,
                    type: values.type,
                    streetName: values.streetName,
                    kmState: values.kmState,
                    startTime: startDate,
                    endTime: endDate,
                    date: date,
                    note: values.note,
                    unpaidBreak: values.type === "pause" ? values.unpaidBreak ?? false : undefined,
                })

            } else {
                createEntry({
                    type: values.type,
                    streetName: values.streetName,
                    kmState: values.kmState,
                    startTime: startDate,
                    endTime: endDate,
                    date: date,
                    note: values.note,
                    unpaidBreak: values.type === "pause" ? values.unpaidBreak ?? false : undefined,
                })
            }
        })}>

            <Box className={twMerge("grid grid-cols-1 md:grid-cols-2  gap-x-5")}>
                <Select
                    className="md:col-span-2 md:w-[calc(50%-(1.25rem/2))]"
                    pt={10}
                    label="Typ"
                    {...form.getInputProps('type')}
                    allowDeselect={false}
                    data={[
                        { value: "entry", label: "Eintrag" },
                        { value: "start", label: "Arbeits begin" },
                        { value: "end", label: "Arbeits ende" },
                        { value: "pause", label: "Pause" },
                    ]}
                />
                {form.values.type === "entry" && <Autocomplete
                    withAsterisk
                    className={twMerge("transit")}
                    pt={10}
                    label="Straßenname"
                    data={streetNames}
                    {...form.getInputProps('streetName')}
                />}
                {<TextInput
                    type="tel"
                    withAsterisk
                    pt={10}
                    label="Kilometerstand"
                    {...form.getInputProps('kmState')}
                />}
                <Group wrap="nowrap" pt={10} className="md:col-span-2 md:gap-x-5 gap-x-2">
                    {form.values.type !== "end" && <TimeInput
                        aria-label="Time" type="time"
                        required
                        className={twMerge("w-[50%] md:w-full", form.values.type === "start" && "w-full col-span-2")}
                        label="Startzeitpunkt"
                        {...form.getInputProps('startTime')}
                    />}
                    {form.values.type !== "start" && <TimeInput
                        required
                        className={twMerge("w-[50%] md:w-full", form.values.type === "end" && "w-full col-span-2")}
                        label="Endzeitpunkt"
                        {...form.getInputProps('endTime')}
                    />}
                </Group>
                {
                    form.values.type === "pause" && <Switch
                        classNames={{
                            body: "align-middle flex",
                        }}
                        mt={15}
                        className={twMerge("w-[50%] md:w-full")}
                        label="Unbezahlte Pause"
                        description="Diese Pause wird nicht in der Summe berücksichtigt."
                        checked={form.values.unpaidBreak}
                        onChange={(e) => {
                            form.setValues({
                                unpaidBreak: e.target.checked,
                            })
                        }}

                    />
                }

                <Textarea
                    className='md:col-span-2'
                    autosize
                    minRows={2}
                    maxRows={4}
                    // resize="vertical"
                    pt={10}
                    label="Notiz"
                    {...form.getInputProps('note')}

                />
                <DateInput
                    className="md:col-span-2 md:w-[calc(50%-(1.25rem/2))] "
                    pt={10}
                    locale="de"
                    classNames={{
                        calendarHeader: "text-white bg-[rgba(0,0,0,0.15)] rounded-md",
                        calendarHeaderControl: "bg-[rgba(0,0,0,0.05)]",
                        day: "data-[selected=true]:bg-[rgba(255,255,255,0.1)] data-[selected=true]:text-white hover:bg-red-500",
                        input: "bg-[rgba(255,255,255,0.05)] text-white",
                    }}
                    styles={{
                        day: {
                            "--mantine-color-dark-5": "rgba(255,255,255,0.1)",
                        }
                    }}
                    popoverProps={{
                        classNames: {
                            dropdown: "bg-[rgba(0,0,0,0.2)] backdrop-blur-xl rounded-md",
                        },
                    }}
                    label="Datum"
                    {...form.getInputProps('date')}
                />
                <Button
                    loading={isCreating || isUpdating}
                    type="submit"
                    mt={15}
                >
                    Speichern
                </Button>
                <Text mt={15} fz={14} c={"var(--mantine-color-error)"} >
                    * Pflichtfelder
                </Text>
            </Box>
        </form >
    )
}