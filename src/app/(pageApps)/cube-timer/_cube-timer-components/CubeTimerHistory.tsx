"use client"

import { ActionIcon, Box, Center, Container, Group, Text, Title, VisuallyHidden, type ContainerProps } from "@mantine/core"
import { twMerge } from "tailwind-merge"
import { useAppStore } from "~/providers/app-store-provider"
import { useCubeStore } from "~/providers/cube-timer-provider"

import type { CubeHistory } from "../_cubeTimerTypes"

import { api } from "~/trpc/react"
import { useEffect, useState } from "react"
import { usePagination, useMounted } from "@mantine/hooks"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faChevronsLeft, faChevronsRight, faTrashCan } from "@fortawesome/pro-duotone-svg-icons"
import { formatTime } from "~/lib/cUtils"

import ReactTimeAgo from 'react-time-ago'

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)


const CubeTimerHistory = ({ history, ...props }: Omit<ContainerProps, "children"> & { history: CubeHistory | undefined }) => {
    const isMounted = useMounted()

    const session = useAppStore((state) => state.session)
    const hideHeader = useAppStore((state) => state.hideHeader)

    const scrambleType = useCubeStore((state) => state.scrambleType)

    const page = useCubeStore((state) => state.page)
    const setPage = useCubeStore((state) => state.setPage)
    const refetchCounter = useCubeStore((state) => state.refetchCounter)

    const [historyState, setHistoryState] = useState<CubeHistory>(history ?? { history: [], totalPages: 1, page: 1, total: 1 })
    const { data, refetch, isFetching, isRefetching } = api.cube.getCubeTimeHistory.useQuery({ cubeSize: scrambleType, page: page }, {
        initialData: undefined, enabled: !!session?.user.id,
    },)

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { mutate: deleteCodeId, isPending: isDeleting, } = api.cube.deleteCubeTime.useMutation({
        onSuccess: () => {
            refetch()
            setDeleteId(null)
        }
    })

    useEffect(() => {
        if (refetchCounter > 0) {
            refetch()
        }
    }, [refetchCounter, refetch])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!isMounted) return
        if (!isFetching && !isRefetching) {

            setHistoryState(data as CubeHistory)
        }
    }, [isFetching, isRefetching])

    const disabled = () => {
        if (isFetching || isRefetching) return true
        if (page < 1) return true
        if (historyState?.totalPages <= 1) return true
        return false
    }

    const { active, first, last, next, previous } = usePagination({
        total: data?.totalPages ?? 1, page: page, onChange(page) {
            setPage(page)
        },
    })

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!session?.user.id || !isMounted) return
        if (active) refetch()
    }, [active, refetch])

    return (
        <Container className={twMerge("h-full w-full bg-[rgba(255,255,255,0.1)] max-h-[calc(100dvh-100px)]  flex flex-col rounded-xl", props.className, hideHeader && "opacity-0")} >
            <Box className="flex-grow pt-1">
                {!!historyState.history.length && historyState.history.map((data) => {
                    return <Box mah={"10%"} h={"10%"} maw={"100%"} key={data.id}
                        className={twMerge("static top-0 left-0 transition-opacity duration-250", (isFetching || isRefetching) ? "animate-pules-fast " : "")}
                    >
                        <Title style={{ fontFamily: "lcd-2" }} c={"white"} fw={500}  >
                            {formatTime(data.time)}
                        </Title>
                        <Group justify="space-between" align="baseline">
                            <Text c={"dimmed"} fw={500}  >
                                {/* {data.cubeSize} */}
                                {isMounted && <ReactTimeAgo date={data.createdAt} locale="en-US" timeStyle={"round"} />}
                            </Text>
                            <ActionIcon
                                disabled={!isMounted || isFetching || isRefetching}
                                // variant={"gradient"}
                                // gradient={{ from: "red", to: "orange" }}
                                className="bg-red-500/50 hover:bg-red-500/75 text-white"
                                size={"sm"}
                                loading={isDeleting && deleteId === data.id}
                                onClick={() => {
                                    setDeleteId(data.id)
                                    deleteCodeId({ id: data.id })
                                }}
                                style={{
                                    "--fa-secondary-opacity": "0.5",
                                }}
                            >
                                <VisuallyHidden>Delete QR Code</VisuallyHidden>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </ActionIcon>
                        </Group>
                    </Box>
                })}
                {!historyState.history.length && <Center
                    className={twMerge("static top-0 left-0 transition-opacity duration-250 h-full", (isFetching || isRefetching) ? "animate-pules-fast " : "")}
                >
                    <Title c={"white"} fw={500}  >
                        No Data
                    </Title>
                </Center>}
            </Box>
            <Group py={10} wrap="nowrap" justify="space-between">
                <Group>
                    <Text fz={13} fw={500} c={"dimmed"}>
                        Page {page} of {historyState?.totalPages > 0 ? historyState?.totalPages : 1}
                    </Text>
                </Group>
                <Group justify="end" gap={5}>
                    <ActionIcon
                        disabled={disabled()}
                        onClick={() => first()}
                    >
                        <FontAwesomeIcon icon={faChevronsLeft} />
                        <VisuallyHidden>First</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled()}
                        style={{
                            "--fa-secondary-opacity": "1",
                        }}
                        onClick={() => previous()}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <VisuallyHidden>Previous</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled()}
                        style={{
                            "--fa-secondary-opacity": "1",
                        }}
                        onClick={() => next()}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                        <VisuallyHidden>Next</VisuallyHidden>
                    </ActionIcon>
                    <ActionIcon
                        disabled={disabled()}
                        onClick={() => last()}
                    >
                        <FontAwesomeIcon icon={faChevronsRight} />
                        <VisuallyHidden>Last</VisuallyHidden>
                    </ActionIcon>
                </Group>
            </Group>
        </Container>
    )
}

export default CubeTimerHistory

