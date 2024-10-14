"use client"

import type { SessionType } from "next-auth"
import { ActionIcon, Box, Group, Select, Text, TextInput, VisuallyHidden } from "@mantine/core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import TimeAgo from "javascript-time-ago"
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from "react-time-ago"
import { useDebouncedCallback, useMounted, usePagination } from "@mantine/hooks"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { faChevronLeft, faChevronRight, faChevronsLeft, faChevronsRight, faSwap, faTrash, faX } from "@fortawesome/pro-duotone-svg-icons"
import ClientIcon from "~/app/_components/ClientIcon"
import { api } from "~/trpc/react"
import { whitelistParser } from "./whitelistParams"
import { useQueryState } from 'nuqs'
import { usePermission } from "~/lib/cUtils"
import { toast } from "sonner"
import { DismissButton } from "~/components/ui/sonner"

TimeAgo.addDefaultLocale(en)

export const ActionButtons = ({ whiteListId, allowed, session }: { whiteListId: string, allowed: boolean | undefined | null, session: SessionType }) => {
    const router = useRouter()
    const { mutate: setAllowed, isPending: isPendingAllowed, isSuccess: isSuccessAllowed, error: errorAllowed } = api.whitelist.changeStatus.useMutation()
    const hasPermission = usePermission(session)


    useEffect(() => {
        if (isSuccessAllowed) {
            router.refresh()
        }
    }, [isSuccessAllowed, router])

    useEffect(() => {
        if (errorAllowed) {
            const errMessage = () => {
                if (errorAllowed.message.toLowerCase().includes("self")) {
                    return "You cannot change the status of yourself."
                }
                if (errorAllowed.message.toLowerCase().includes("admin")) {
                    return "You cannot change the status of admins."
                }
                return errorAllowed.message
            }

            toast.error("Error changing status.", {
                id: "changing-status-error",
                cancel: <DismissButton id="changing-status-error" />,
                description: (
                    <Box>
                        {errMessage()}
                    </Box>
                ),
            })
        }
    }, [errorAllowed])



    return (
        <Group wrap="nowrap" gap={5}>
            {hasPermission("editWhitelistStatus") && <ActionIcon size={"sm"}
                disabled={isPendingAllowed}
                loading={isPendingAllowed}
                onClick={() => {
                    setAllowed({ allowed: !allowed, whiteListId })
                }}
                className="bg-green-800  hover:bg-green-700 "
            >
                <VisuallyHidden>Toggle Status </VisuallyHidden>
                <ClientIcon icon={faSwap} fontSize={14} />
            </ActionIcon>}
            {hasPermission("deleteWhitelistEntry") && <ActionIcon size={"sm"}
                disabled
                className="bg-[rgba(0,0,0,0.15)]  hover:bg-[rgba(0,0,0,0.2)] "
            >
                <VisuallyHidden>Delete Whitelist Entry</VisuallyHidden>
                <ClientIcon icon={faTrash} fontSize={14} />
            </ActionIcon>}
        </Group>
    )

}


export const LastLogin = ({ date }: { date: Date | null | undefined }) => {
    const mounted = useMounted()


    if (!date || !mounted) return
    return (
        <ReactTimeAgo date={date} locale="en-US" timeStyle={"round"} />
    )
}


export const Search = () => {
    const [searchState, setSearchState] = useQueryState('search', whitelistParser.search)
    const [search, setSearch] = useState<string>(searchState ?? "")
    const router = useRouter()

    const waitAndChange = useDebouncedCallback((_search: string) => {
        setSearchState(search)
        console.log("search", searchState)
        setTimeout(() => {
            router.refresh()
        }, 100)
    }, 1000)

    return (
        <TextInput
            w={350}
            styles={{
                wrapper: {
                    background: "transparent",
                },
                input: {
                    background: "rgba(255,255,255,0.05)",
                }
            }}
            placeholder="Search"
            value={search ?? ""}
            onChange={(e) => {
                setSearch(e.target.value)
                waitAndChange(e.target.value)
            }}
            rightSection={
                <ActionIcon
                    size={"sm"}
                    variant="transparent"
                    className="text-slate-500 hover:text-slate-400"
                    onClick={() => {
                        setSearch("")
                        setSearchState("")
                        setTimeout(() => {
                            router.refresh()
                        }, 100)
                    }}
                >
                    <FontAwesomeIcon icon={faX} swapOpacity />
                </ActionIcon>
            }
        />
    )
}

export const WhitelistPagination = ({ totalRows }: { totalRows: number }) => {
    const router = useRouter()

    const [limitState, setLimitState] = useQueryState('limit', whitelistParser.limit)
    const [pageState, setPageState] = useQueryState('page', whitelistParser.page)

    const [limit, setLimit] = useState<string | number>(limitState ?? "10")
    const [page, setPage] = useState(pageState ?? 1)

    const totalPages = Math.ceil(totalRows / Number.parseInt(`${limit}`))
    const { active, next, last, first, previous } = usePagination({ total: totalPages, page, onChange: setPage })


    const waitAndChange = useDebouncedCallback(() => {
        setPageState(page)
        setLimitState(Number.parseInt(`${limit}`))
        setTimeout(() => {
            router.refresh()
        }, 100)
    }, 250)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        waitAndChange()
    }, [active, limit, waitAndChange])

    const disabled = () => {
        if (page < 1) return true
        if (totalPages <= 1) return true
        return false
    }

    return (
        <Group justify="end" wrap="nowrap">
            <Group>
                <Select
                    w={100}
                    classNames={{
                        wrapper: "bg-transparent",
                        input: "text-white bg-[rgba(255,255,255,0.05)] rounded-md",
                        dropdown: "text-white bg-[rgba(0,0,0,0.3)] backdrop-blur-lg",
                        option: "hover:bg-[rgba(255,255,255,0.1)] rounded-md",
                    }}
                    value={`${limit}`}
                    onChange={(e) => {
                        setLimit(e ?? "10")
                    }}
                    data={["1", "5", "10", "20", "50", "100"]}
                    defaultValue={"10"}
                    allowDeselect={false}
                />
            </Group>
            <Group py={10} wrap="nowrap" justify="space-between">
                <Group>
                    <Text fz={13} fw={500} c={"dimmed"}>
                        Page {page} of {totalPages}
                    </Text>
                </Group>
                <Group justify="end" gap={5}>
                    <ActionIcon
                        disabled={disabled() || page === 1}
                        onClick={() => first()}
                    >
                        <FontAwesomeIcon icon={faChevronsLeft} />
                        <VisuallyHidden>First</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled() || page === 1}
                        style={{
                            "--fa-secondary-opacity": "1",
                        }}
                        onClick={() => previous()}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <VisuallyHidden>Previous</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled() || page === totalPages}
                        style={{
                            "--fa-secondary-opacity": "1",
                        }}
                        onClick={() => next()}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                        <VisuallyHidden>Next</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled() || page === totalPages}
                        onClick={() => last()}
                    >
                        <FontAwesomeIcon icon={faChevronsRight} />
                        <VisuallyHidden>Last</VisuallyHidden>
                    </ActionIcon>
                </Group>
            </Group>
        </Group>
    )



}