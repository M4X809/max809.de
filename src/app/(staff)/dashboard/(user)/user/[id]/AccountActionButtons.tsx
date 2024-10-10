"use client"

import { faBoltLightning } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@mantine/core"
import type { SessionType, User } from "next-auth"
import { useRouter } from "next/navigation"
import { type ButtonHTMLAttributes, forwardRef, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { usePermission } from "~/lib/cUtils"
import { api } from "~/trpc/react"




interface ResetPermissionsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    id: User["id"];
    session: SessionType;
}

export const ResetPermissionsButton = forwardRef<HTMLButtonElement, ResetPermissionsButtonProps>(({ id, session }, _ref) => {
    const hasPermission = usePermission(session)
    const { mutate, isPending, isSuccess } = api.management.resetPermissions.useMutation()

    const router = useRouter()

    useEffect(() => {
        if (isSuccess) {
            router.refresh()
        }
    }, [isSuccess, router])

    if (!hasPermission("resetPermissions")) return null

    return (
        <Button
            className={twMerge("transition-colors ease-in-out duration-1000 bg-gradient-to-tr from-[darkred] to-[#CB356B]")}
            hidden={!hasPermission("resetPermissions")}
            leftSection={<FontAwesomeIcon fontSize={20} icon={faBoltLightning} />}
            loading={isPending}
            disabled={isPending}
            onClick={() => {
                mutate({ id: id })
            }}
            fullWidth
            variant="gradient"
        >
            Reset Permissions
        </Button>
    )




})

interface LogoutAllDevicesButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    id: User["id"];
    session: SessionType;
}

export const LogoutAllDevicesButton = forwardRef<HTMLButtonElement, LogoutAllDevicesButtonProps>(({ id, session }, _ref) => {
    const hasPermission = usePermission(session)
    const { mutate, isPending, isSuccess } = api.management.logoutAllDevices.useMutation()

    const router = useRouter()

    useEffect(() => {
        if (isSuccess) {
            router.refresh()
        }
    }, [isSuccess, router])

    if (!hasPermission("logoutAllDevices")) return null

    return (
        <Button
            className={twMerge("transition-colors ease-in-out duration-1000 bg-gradient-to-tr from-[orange] to-[darkorange]")}
            hidden={!hasPermission("logoutAllDevices")}
            leftSection={<FontAwesomeIcon fontSize={20} icon={faBoltLightning} />}
            loading={isPending}
            disabled={isPending}
            onClick={() => {
                mutate({ id: id })
            }}
            c={"black"}
            fullWidth
            variant="gradient"
        >
            Logout All Devices
        </Button>
    )

})
interface DeleteUserButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    id: User["id"];
    session: SessionType;
}

export const DeleteUserButton = forwardRef<HTMLButtonElement, DeleteUserButtonProps>(({ id, session }, _ref) => {
    const hasPermission = usePermission(session)
    const { mutate, isPending, isSuccess } = api.management.logoutAllDevices.useMutation()

    const router = useRouter()

    useEffect(() => {
        if (isSuccess) {
            router.refresh()
        }
    }, [isSuccess, router])

    if (!hasPermission("deleteUser")) return null

    return (
        <Button
            className={twMerge("transition-colors ease-in-out duration-1000 bg-gradient-to-tr from-[red] to-[darkred]", "bg-[rgba(255,255,255,0.15)]  from-[#ff000000] to-[#8b000000] ")}
            hidden={!hasPermission("deleteUser")}
            leftSection={<FontAwesomeIcon fontSize={20} icon={faBoltLightning} />}
            loading={isPending}
            disabled={true}
            // onClick={() => {
            //     mutate({ id: id })
            // }}
            fullWidth
            variant="gradient"
        >
            Delete User
        </Button>
    )

})

