"use client"

import { faCommand, faEnvelope, faKeyboard } from "@fortawesome/pro-duotone-svg-icons"
import { ActionIcon, Group, Input, Stack, Switch, Text } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import ClientIcon from "~/app/_components/ClientIcon"
import { useManagementStore } from "~/providers/management-store-provider"
import type { User } from "../../../_dash-components/UserCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { twMerge } from "tailwind-merge"
import { Key } from "ts-key-enum"

const UserConfig = ({ user }: { user: User }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const loginWithEmail = useManagementStore((state) => state.loginWithEmail)
    const setLoginWithEmail = useManagementStore((state) => state.setLoginWithEmail)
    const setLoginWithEmailChanged = useManagementStore((state) => state.setLoginWithEmailChanged)

    const openCommandKey = useManagementStore((state) => state.openCommandKey)
    const setOpenCommandKey = useManagementStore((state) => state.setOpenCommandKey)
    const setOpenCommandKeyChanged = useManagementStore((state) => state.setOpenCommandKeyChanged)

    const waitingForInput = useManagementStore((state) => state.waitingForInput)
    const setWaitingForInput = useManagementStore((state) => state.setWaitingForInput)

    useEffect(() => {
        if (loginWithEmail !== user.allowSigninWithEmail) {
            setLoginWithEmailChanged(true)
        } else {
            setLoginWithEmailChanged(false)
        }
    }, [loginWithEmail, user.allowSigninWithEmail, setLoginWithEmailChanged])

    useEffect(() => {
        setLoginWithEmail(user.allowSigninWithEmail)
    }, [user, setLoginWithEmail])


    useEffect(() => {
        if (openCommandKey !== user.config?.global?.openCommandKey) {
            setOpenCommandKeyChanged(true)
        } else {
            setOpenCommandKeyChanged(false)
        }
    }, [openCommandKey, user.config?.global?.openCommandKey, setOpenCommandKeyChanged])

    useEffect(() => {
        setOpenCommandKey(user.config?.global?.openCommandKey ?? "F1")
    }, [user, setOpenCommandKey])


    useEffect(() => {
        if (waitingForInput) {
            inputRef.current?.focus()
        } else {
            inputRef.current?.blur()
        }
    }, [waitingForInput])




    return (
        <Stack className='grid grid-cols-2 md:grid-cols-1 gap-4' >
            <Group wrap='nowrap' justify='space-between' >
                <Group wrap='nowrap'>
                    <ClientIcon icon={faEnvelope} />
                    <Text fz={13} fw={500}>
                        Login with Email
                    </Text>
                </Group>
                <Switch
                    checked={!!loginWithEmail}
                    onChange={(e) => {
                        setLoginWithEmail(e.target.checked)
                    }}
                />
            </Group>
            <Group wrap='nowrap' justify='space-between' >
                <Group wrap='nowrap'>
                    <ClientIcon icon={faCommand} />
                    <Text fz={13} fw={500}>
                        Command Window
                    </Text>
                </Group>
                <Input
                    ref={inputRef}
                    readOnly
                    onFocusCapture={() => {
                        if (!waitingForInput) {
                            inputRef.current?.blur()
                        }
                    }}
                    onBlurCapture={() => {
                        if (waitingForInput) {
                            inputRef.current?.focus()
                        }
                    }}
                    rightSection={
                        <ActionIcon
                            size={"sm"}
                            onClick={() => {
                                setWaitingForInput((prev) => !prev)
                            }}
                        >
                            <FontAwesomeIcon icon={faKeyboard} />
                        </ActionIcon>
                    }
                    rightSectionPointerEvents="visible"
                    className={twMerge("pointer-events-none")}
                    value={!waitingForInput ? `${openCommandKey.toString().toUpperCase()}` : "Press a key"}
                    onKeyDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (e.key === "Escape" && waitingForInput) {
                            setWaitingForInput(false)
                            return
                        }
                        if (waitingForInput) {
                            setOpenCommandKey(e.key)
                            setWaitingForInput(false)
                            return
                        }
                    }}
                />
            </Group>
        </Stack>
    )
}

export default UserConfig