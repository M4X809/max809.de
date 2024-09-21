import { Box, type BoxProps } from "@mantine/core"




const ErrorBox = ({ value, visible = false, ...props }: { value: React.ReactNode, visible: boolean } & Omit<BoxProps, "bg" | "c" | "p" | "w" | "hidden" | "children">) => {
    return (
        <Box
            {...props}
            w={"100%"}
            style={{ borderRadius: "5px" }}
            p={"sm"}
            c={"#fa2113"}
            bg={"#0D1117"}
            hidden={!visible}
        >
            {value}
        </Box>
    )
}

export default ErrorBox