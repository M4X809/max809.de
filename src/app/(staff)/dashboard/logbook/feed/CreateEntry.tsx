"use client"

import { Autocomplete, Box, Button, Group, Select, TextInput } from "@mantine/core"
import { twMerge } from "tailwind-merge"

import { useForm } from "@mantine/form";
import { DateInput, TimeInput } from '@mantine/dates';
import { useMounted } from "@mantine/hooks";
import { api } from "~/trpc/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DismissButton } from "~/components/ui/sonner";


const CreateEntry = ({ streetNames }: { streetNames: string[] }) => {
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
                // const isPause = form.values.type === "pause"
                // if (isPause) return false
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
        }

        )
        }>

            <Box
                className={twMerge("grid grid-cols-1 md:grid-cols-2  gap-x-5")}
            >
                <Select
                    className="md:col-span-2 md:w-[calc(50%-(1.25rem/2))] "

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
                />
                }
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
                            // @ts-ignore
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



        </form>
    )
}

export default CreateEntry