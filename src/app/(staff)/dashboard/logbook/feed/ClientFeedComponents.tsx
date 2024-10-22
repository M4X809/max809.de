"use client"
import { faCalendarAlt, faChevronLeft, faChevronRight, faTrashCan } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Autocomplete, Box, Button, Center, Group, Modal, Select, TextInput, VisuallyHidden } from '@mantine/core'
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
            <Group wrap='nowrap' gap={1}>
                <ActionIcon
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
    // const router = useRouter()
    // const { mutate: deleteEntry, isPending: isDeleting, isSuccess: isDeleteSuccess, error: deleteError, reset: resetDeleteMutation } = api.logbook.deleteEntry.useMutation()

    // useEffect(() => {
    //     if (isDeleteSuccess) {
    //         router.refresh()
    //     }
    // }, [isDeleteSuccess, router])


    return (
        <></>
        // <ActionIcon
        //     variant='light'
        //     className='text-slate-500 hover:text-slate-400'
        //     onClick={() => {
        //         deleteEntry({ id: id })
        //     }}
        //     loading={isDeleting}
        //     disabled={isDeleting}
        // >
        //     <FontAwesomeIcon icon={faTrashCan} />

        // </ActionIcon>
    )
}



export const CreateEntry = ({ streetNames }: { streetNames: string[] }) => {
    const router = useRouter()
    const { mutate: createEntry, isPending: isCreating, isSuccess: isCreated, error: createError } = api.logbook.createEntry.useMutation()

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            type: "entry" as "start" | "end" | "pause" | "entry",
            streetName: "",
            kmState: "",
            startTime: "",
            endTime: "",
            date: new Date(),
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
                return value.length > 0 ? false : 'Der Kilometerstand darf nicht leer sein.'
            },
        },
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (isCreated) {
            const type = form.values.type
            const date = form.values.date
            form.reset()
            form.setValues({
                type: type === "pause" ? "entry" : type,
                date: date,
            })
            router.refresh()
        }

        if (createError) {
            toast.error("Fehler beim Erstellen des Eintrags.", {
                id: "creating-error",
                cancel: <DismissButton id="creating-error" />,
                description: (
                    <Box>
                        {createError.message}
                    </Box>
                ),
            })
        }
    }, [isCreated, form.reset, router, createError, form.setValues])





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

            createEntry({
                type: values.type,
                streetName: values.streetName,
                kmState: values.kmState,
                startTime: startDate,
                endTime: endDate,
                date: date,
            })
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
                    className={twMerge("transit")}
                    pt={10}
                    label="Straßen Name"
                    data={streetNames}
                    {...form.getInputProps('streetName')}
                />}
                {<TextInput
                    type="tel"
                    pt={10}
                    label="Kilometerstand"
                    {...form.getInputProps('kmState')}
                />}
                <Group wrap="nowrap" pt={10} className="md:col-span-2 md:gap-x-5 gap-x-2">
                    {form.values.type !== "end" && <TimeInput
                        aria-label="Time" type="time"
                        className={twMerge("w-[50%] md:w-full", form.values.type === "start" && "w-full col-span-2")}
                        label="Start Zeitpunkt"
                        {...form.getInputProps('startTime')}
                    />}
                    {form.values.type !== "start" && <TimeInput
                        className={twMerge("w-[50%] md:w-full", form.values.type === "end" && "w-full col-span-2")}
                        label="End Zeitpunkt"
                        {...form.getInputProps('endTime')}
                    />}
                </Group>
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
                {<Button
                    loading={isCreating}
                    type="submit"
                    mt={15}
                >
                    Speichern
                </Button>}
            </Box>
        </form >
    )
}