"use client"
import { faEye, faTrashCan } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, ActionIconGroup, Center, LoadingOverlay, Modal, TextInput } from "@mantine/core"
import { useManagementStore } from "~/providers/management-store-provider"
import MyCanvas from "~/app/(pageApps)/qr-code-generator/_qr-components/QrCode"
import { api } from "~/trpc/react"
import LoadQrConfig from "~/app/(pageApps)/qr-code-generator/_qr-components/LoadQrConfig"
import { useQrCodeStore } from "~/providers/qr-code-provider"
import { useEffect } from "react"
import type { SessionType } from "next-auth"
import { usePermission } from "~/lib/cUtils"
import { z } from "zod"
import { useRouter } from "next/navigation"


export const ActionGroup = ({ qrId, userId, session }: { qrId: string, userId: string, session: SessionType }) => {

    const togglePreviewCodeOpen = useManagementStore((state) => state.togglePreviewCodeOpen)
    const setPreviewCodeId = useManagementStore((state) => state.setPreviewCodeId)
    const hasPermission = usePermission(session)

    const router = useRouter()


    const {
        mutate: deleteQrCode,
        isPending: isDeleting,
        isSuccess: isDeleteSuccess,
    } = api.management.deleteQrCode.useMutation()

    useEffect(() => {
        if (isDeleteSuccess) {
            router.refresh()
        }

    }, [isDeleteSuccess, router])


    return (
        <ActionIconGroup>
            {hasPermission("viewQrPreview") &&
                <ActionIcon
                    size={"lg"}
                    onClick={() => {
                        setPreviewCodeId(qrId)
                        togglePreviewCodeOpen()
                    }}
                    className="bg-lime-700 hover:bg-lime-800 text-white ">
                    <FontAwesomeIcon icon={faEye} />
                </ActionIcon>}
            {hasPermission("deleteQrCode") &&
                <ActionIcon
                    onClick={() => {
                        deleteQrCode({ qrId: qrId, userId: userId })
                    }}
                    loading={isDeleting || isDeleteSuccess}
                    size={"lg"}
                    className="bg-red-700 hover:bg-red-800 text-white">
                    <FontAwesomeIcon icon={faTrashCan} />
                </ActionIcon>}
        </ActionIconGroup>
    )

}

export const PreviewCode = () => {

    const togglePreviewCodeOpen = useManagementStore((state) => state.togglePreviewCodeOpen)
    const previewCodeOpen = useManagementStore((state) => state.previewCodeOpen)
    const previewCodeId = useManagementStore((state) => state.previewCodeId)
    const resetQrCode = useQrCodeStore((state) => state.resetAllQrCodeSates)
    const { data: previewCode, isLoading: isLoadingPreviewCode } = api.management.getPreviewQr.useQuery({ qrId: previewCodeId ?? "" }, { enabled: !!previewCodeId })

    useEffect(() => {
        if (!previewCodeId) {
            resetQrCode()
        }
    }, [previewCodeId, resetQrCode])

    return (
        <Modal
            className="w-fit h-fit bg-transparent "
            centered
            opened={previewCodeOpen}
            withCloseButton={false}
            bg={"transparent"}
            classNames={{
                body: "bg-transparent w-[500px] h-[500px]",
                content: "bg-[rgba(0,0,0,0.1)] w-[500px] h-[500px] min-w-[500px] min-h-[500px] rounded-xl backdrop-blur-xl ",
            }}
            onClose={() => {
                togglePreviewCodeOpen()
            }}
        >
            {(!previewCode || isLoadingPreviewCode) && <LoadingOverlay transitionProps={{
                duration: 500,
            }} visible={true} w={500} h={500} />}

            {!!previewCode &&
                <>
                    <LoadQrConfig
                        autoLoad
                        data={previewCode}
                    />
                    <Center>
                        <MyCanvas />
                    </Center>
                </>
            }
        </Modal>
    )
}

export const SetLimitInput = ({ currentLimit }: { id: string, session: SessionType, currentLimit: string | undefined | number }) => {

    const limit = useManagementStore((state) => state.limit)
    const setLimit = useManagementStore((state) => state.setLimit)
    const setLimitChanged = useManagementStore((state) => state.setLimitChanged)

    useEffect(() => {
        if (currentLimit) {
            setLimit(currentLimit)
        }
    }, [currentLimit, setLimit])

    useEffect(() => {
        if (limit !== currentLimit) {
            setLimitChanged(true)
        } else {
            setLimitChanged(false)
        }
    }, [limit, currentLimit, setLimitChanged])

    return (
        <TextInput
            label="Limit"
            description="The maximum number of QR codes the user can save."
            styles={{
                wrapper: {
                    background: "transparent",
                },
                input: {
                    background: "rgba(255,255,255,0.05)",
                }
            }}
            value={limit ?? currentLimit}
            onChange={(e) => {
                const newLimit = z.number().safeParse(Number.parseInt(e.target.value))
                if (newLimit.success) {
                    setLimit(newLimit.data)
                } else {
                    setLimit("")
                }
            }}
            min={1}
            max={10000}
            onBlur={() => {
                const newLimit = z.number().min(1).max(10000).safeParse(typeof limit === "string" ? Number.parseInt(limit) : limit)
                if (newLimit.error) {
                    if (newLimit.error.issues[0]?.code === "too_small") {
                        return setLimit(1)
                    }
                    if (newLimit.error.issues[0]?.code === "too_big") {
                        return setLimit(10000)
                    }
                    setLimit(1)
                }
            }}
            size="sm"
        />
    )















}