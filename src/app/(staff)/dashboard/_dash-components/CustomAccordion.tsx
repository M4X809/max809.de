"use client"
import { Accordion, Stack } from "@mantine/core";
import { useDebouncedCallback, useDocumentTitle } from "@mantine/hooks";
import { useState } from "react";
import { api } from "~/trpc/react";

interface AccordionProps {
    image: string | null | undefined;
    userName: string | null | undefined;
    children?: React.ReactNode | React.ReactNode[];
    defaultOpen: string[];

}

const CustomAccordion: React.FC<AccordionProps> = ({ children, userName, defaultOpen }) => {
    useDocumentTitle(`${userName} - User Management`);

    const { mutate: setConfig } = api.account.setConfig.useMutation()

    const handleStateChange = useDebouncedCallback((val) => {
        setConfig({ path: "userPage.expanded", value: val })

    }, 1000);

    const [value, setValue] = useState<string[]>(defaultOpen);

    return (
        <>
            <Accordion
                variant="filled"
                radius={"md"}
                multiple
                value={value}
                defaultValue={defaultOpen}
                onChange={(val) => {
                    setValue(val)
                    handleStateChange(val)
                }}
            >
                <Stack>
                    {children}
                </Stack>
            </Accordion>
        </>
    )
}


export default CustomAccordion