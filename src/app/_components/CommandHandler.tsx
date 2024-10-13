"use client"
import { useDisclosure, } from '@mantine/hooks'
import type { SessionType } from 'next-auth'
import React, { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '~/components/ui/command'

import type { CommandGroups, } from '~/components/ui/command'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Text } from '@mantine/core'
import { useIsAdmin, useIsStaff, usePermission } from '~/lib/cUtils'
import { faArrowRightToBracket, faArrowsRotate, faIcons, faNote, faQrcode, faSave, faScrewdriverWrench, faSpinner, faStopwatch, faUser, faUserShield } from '@fortawesome/pro-duotone-svg-icons'
import { usePathname, useRouter } from 'next/navigation'
import { useManagementStore } from '~/providers/management-store-provider'
import { twMerge } from 'tailwind-merge'
import { signOut } from 'next-auth/react'

const defaultCommands: CommandGroups[] = [
    {
        type: "group",
        permission: ["editUser", "editUserPermissions", "setStaff", "setAdmin", "changeQrLimits"],
        heading: "User",
        onlyOnPath: ["/dashboard/user"],
        commands: [
            {
                icon: faSave,
                key: "saveUser",
                label: "Save User",
                keywords: ["save", "user"],
                onSelect: ({ saveUserFunc, close }) => {
                    if (saveUserFunc) {
                        saveUserFunc()
                        close()
                    }
                },
                disabled({ saveDisabled }) {
                    if (saveDisabled) return true
                    return false
                },
            }
        ],
    },

    {
        type: "separator",
        key: "saveUser",
        onlyOnPath: ["/dashboard/user"],
        permission: ["editUser", "editUserPermissions", "setStaff", "setAdmin", "changeQrLimits"],
    },
    {
        type: "group",
        permission: ["viewUser"],
        heading: "Staff Dashboard",
        commands: [
            {
                icon: faScrewdriverWrench,
                key: "dashboard",
                label: "Dashboard",
                keywords: ["dashboard", "staff"],
                onSelect: ({ close, router }) => {
                    router.push("/dashboard")
                    close()
                },
                requireStaff: true,

            },
            {
                icon: faUserShield,
                key: "userManagement",
                label: "User Management",
                keywords: ["user", "management", "staff"],
                onSelect: ({ close, router }) => {
                    router.push("/dashboard/user-management")
                    close()
                },
                permission: ["viewUser"],
            }
        ],
    },
    {
        type: "separator",
        key: "pageApps",
        permission: ["viewUser"],
    },
    {
        type: "group",
        heading: "Apps",
        commands: [
            {
                icon: faQrcode,
                key: "qrCodeGenerator",
                label: "QR Code Generator",
                keywords: ["qrcode", "generator", "app"],
                onSelect: ({ close, router }) => {
                    router.push("/qr-code-generator")
                    close()
                },
            },
            {
                icon: faIcons,
                key: "emojiFavicon",
                label: "Emoji Favicon",
                keywords: ["emoji", "favicon", "app"],
                onSelect: ({ close, router }) => {
                    router.push("/emoji-favicon")
                    close()
                },
            },
            {
                icon: faStopwatch,
                key: "cubeTimer",
                label: "Cube Timer",
                keywords: ["cube", "timer", "app"],
                onSelect: ({ close, router }) => {
                    router.push("/cube-timer")
                    close()
                },
            }
        ],
    },
    {
        type: "separator",
        key: "apps",
    },
    {
        type: "group",
        heading: "Other Apps",
        commands: [
            {
                icon: faNote,
                key: "noteMark",
                label: "Note Mark",
                keywords: ["note", "mark", "app", "other"],
                onSelect: ({ close, router }) => {
                    router.push("/note-mark")
                    close()
                },
            }
        ]
    },
    {
        type: "separator",
        key: "otherApps",
    },
    {
        type: "group",
        heading: "Page",
        commands: [
            {
                icon: faArrowsRotate,
                className: 'text-lime-500 data-[selected=true]:text-lime-400',
                key: "Reload",
                label: "Reload",
                keywords: ["reload", "page", "refresh"],
                onSelect: ({ router, close }) => {
                    close()
                    router.refresh()
                },
            }
        ],
    },
    {
        type: "separator",
        key: "page",
    },


    {
        type: "group",
        heading: "Account",
        commands: [
            ({ session, close, router }) => {
                if (!session) return

                return {
                    icon: faUser,
                    key: "ownEditPage",
                    label: `Editing Page: ${session.user.name}`,
                    keywords: ["edit", "page", "account", `${session.user.name}`],
                    permission: ["viewUserPage"],
                    onSelect: () => {
                        router.push(`/dashboard/user/${session.user.id}`)
                        close()
                    },
                    className: 'text-yellow-500 data-[selected=true]:text-yellow-600'
                }
            },
            ({ setLoading }) => {
                return {
                    icon: faArrowRightToBracket,
                    key: "logout",
                    label: "Sign Out",
                    keywords: ["sign", "out", "account"],
                    onSelect: async () => {
                        setLoading("logout")
                        // await new Promise((resolve) => setTimeout(resolve, 1000))
                        await signOut({ callbackUrl: "/" })
                        setTimeout(() => {
                            setLoading(undefined)
                        }, 1000)
                    },
                    className: 'text-red-500 data-[selected=true]:text-red-600'
                }
            }
        ]
    }

]


const CommandHandler = ({ session, commands = defaultCommands, keys = "F1" }: { session: SessionType, commands?: CommandGroups[], keys?: string | readonly string[] }) => {
    const [opened, { toggle, close }] = useDisclosure(false)
    const [loading, setLoading] = useState<string | undefined>(undefined)

    const incrementSaveUserCounter = useManagementStore((state) => state.increaseSaveUserCounter)
    const saveDisabled = useManagementStore((state) => state.saveDisabled)

    const router = useRouter()
    const currentPath = usePathname()


    const hasPermission = usePermission(session)
    const isAdmin = useIsAdmin(session)
    const isStaff = useIsStaff(session)

    useHotkeys(keys, () => {
        toggle()
    }, {
        preventDefault: true,
        enabled: true,
        enableOnContentEditable: true,
        enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    })

    return (

        <CommandDialog open={opened} onOpenChange={toggle}>
            <CommandInput
                className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white px-3'
                placeholder="Type a command or search..." />
            <CommandList className='bg-transparent '>
                <CommandEmpty>No results found.</CommandEmpty>
                {commands?.map((command) => {
                    if (command.type === "separator") {
                        if (command.permission && !hasPermission(command.permission)) return null
                        if (command.requireAdmin && !isAdmin) return null
                        if (command.requireStaff && !isStaff) return null
                        if (command.onlyOnPath && !command.onlyOnPath.every((path) => currentPath.includes(path))) return null

                        return <CommandSeparator key={command.key} alwaysRender={command.alwaysRender} />
                    }
                    if (command.type === "group") {
                        if (command.permission && !hasPermission(command.permission)) return null
                        if (command.requireAdmin && !isAdmin) return null
                        if (command.requireStaff && !isStaff) return null
                        if (command.onlyOnPath && !command.onlyOnPath.every((path) => currentPath.includes(path))) return null



                        return <CommandGroup heading={command.heading} key={command.heading}>
                            {command.commands.map((_command) => {
                                const command = typeof _command === "function" ? _command({ close, router, session, setLoading }) : _command

                                if (!command) return null


                                if (command.permission && !hasPermission(command.permission)) return null
                                if (command.requireAdmin && !isAdmin) return null
                                if (command.requireStaff && !isStaff) return null
                                if (command.onlyOnPath && !command.onlyOnPath.every((path) => currentPath.includes(path))) return null

                                return <CommandItem
                                    className={twMerge(command.className)}
                                    key={command.key}
                                    value={command.key}
                                    keywords={command.keywords}
                                    onSelect={(val) => {
                                        command.onSelect({ val, close, router, saveUserFunc: incrementSaveUserCounter })
                                    }}
                                    disabled={
                                        typeof command.disabled === "function" ? command.disabled({ val: command.key, saveDisabled }) : command.disabled
                                    }
                                >
                                    {loading !== command.key && <FontAwesomeIcon icon={command.icon} className="mr-2 " fontSize={20} />}
                                    {/* @ts-ignore */}
                                    {loading === command.key && <FontAwesomeIcon icon={faSpinner} className="mr-2 " fontSize={20} spin style={{ "--fa-animation-duration": "1s", "--fa-animation-timing": "ease-in" }} />}
                                    <Text component='span'>{command.label}</Text>
                                </CommandItem>
                            })}
                        </CommandGroup>
                    }
                })}
            </CommandList>
        </CommandDialog>
    )
}

export default CommandHandler