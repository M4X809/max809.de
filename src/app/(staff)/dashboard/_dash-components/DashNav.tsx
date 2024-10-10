import { faHome, faScrewdriverWrench, faUser } from "@fortawesome/pro-duotone-svg-icons"
import { Box, Container } from "@mantine/core"
import type { Session } from "next-auth"
import NavSidebar, { type NavMenuItemProps } from "~/app/_components/NavSidebar"

const DashNav = ({ children, session, }: { children: React.ReactNode, session: Session | null | undefined }) => {
    const elements = (): NavMenuItemProps[] => {
        const data: NavMenuItemProps[] = [
            {
                type: "divider",
                label: "Info",
                icon: faHome,
            },
            {
                type: "item",
                label: "Dashboard",
                to: "/dashboard",
                icon: faScrewdriverWrench,
            },
            {
                type: "item",
                label: "User Management",
                to: "/dashboard/user-management",
                icon: faUser,
                permission: "viewUser",

            }
        ]
        return data
    }

    return (
        <Box>
            <NavSidebar elements={elements()} session={session} />
            <Container size={"lg"} >
                {children}
            </Container>

        </Box>

    )
}

export default DashNav