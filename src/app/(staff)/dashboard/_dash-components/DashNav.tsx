import { faHome, faList, faScrewdriverWrench, faUser } from "@fortawesome/pro-duotone-svg-icons"
import { Box, Container, type MantineSize } from "@mantine/core"
import type { Session } from "next-auth"
import NavSidebar, { type NavMenuItemProps } from "~/app/_components/NavSidebar"

const DashNav = ({ session }: { session: Session | null | undefined }) => {
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
                requireStaff: true,
            },
            {
                type: "item",
                label: "User Management",
                to: "/dashboard/user-management",
                icon: faUser,
                permission: "viewUser",
            },
            {
                type: "item",
                label: "Login Whitelist",
                to: "/dashboard/login-whitelist",
                icon: faList,
                permission: "viewWhitelist",
            }
        ]
        return data
    }

    return (
        <NavSidebar elements={elements()} session={session} />
    )
}

export default DashNav