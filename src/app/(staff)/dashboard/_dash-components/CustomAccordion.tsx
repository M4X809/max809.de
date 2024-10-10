"use client"
import { Accordion } from "@mantine/core";
import { useDocumentTitle, useSessionStorage } from "@mantine/hooks";

interface AccordionProps {
    image: string | null | undefined;
    userName: string | null | undefined;
    children?: React.ReactNode | React.ReactNode[];
}

const CustomAccordion: React.FC<AccordionProps> = ({ children, userName, }) => {
    useDocumentTitle(`${userName} - User Management`);

    const [value, setValue] = useSessionStorage<string[]>({
        key: "userEditAccordion",
        defaultValue: ["permissions"],
    });
    return (
        <>
            <Accordion
                variant="filled"
                radius={"md"}
                multiple
                value={value}
                onChange={setValue}
            >
                {children}
            </Accordion>
        </>
    )
}


export default CustomAccordion