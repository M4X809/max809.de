"use client"
import { faCalendarAlt, faChevronLeft, faChevronRight, faTrashCan } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Button, Center, Group, Modal, VisuallyHidden } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from 'react'
import { api } from '~/trpc/react'
import { feedSearchParamsParser } from './feedSearchParams'
import { DatePicker } from '@mantine/dates'
import { useDebouncedCallback } from '@mantine/hooks'

// new Intl.DateTimeFormat("de-DE", {
//     dateStyle: "full",
//     timeStyle: "full",
//     localeMatcher: "best fit",
// });


export const DayPagination = () => {
    const router = useRouter()
    const [day, setDay] = useQueryState('day', feedSearchParamsParser.day)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [day2, month, year] = day.split(".").map(Number);
    console.log("day", day)
    console.log("day2", day2)
    console.log("month", month)
    console.log("year", year)

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
    const router = useRouter()
    const { mutate: deleteEntry, isPending: isDeleting, isSuccess: isDeleteSuccess, error: deleteError, reset: resetDeleteMutation } = api.logbook.deleteEntry.useMutation()

    useEffect(() => {
        if (isDeleteSuccess) {
            router.refresh()
        }
    }, [isDeleteSuccess, router])


    return (
        <ActionIcon
            variant='light'
            className='text-slate-500 hover:text-slate-400'
            onClick={() => {
                deleteEntry({ id: id })
            }}
            loading={isDeleting}
            disabled={isDeleting}
        >
            <FontAwesomeIcon icon={faTrashCan} />

        </ActionIcon>
    )
}

