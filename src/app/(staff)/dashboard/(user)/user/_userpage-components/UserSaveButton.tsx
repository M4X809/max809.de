"use client"
import { faArrowsRotate, faSave } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Group, VisuallyHidden } from '@mantine/core'
import { useParams, useRouter, } from 'next/navigation'
import React, { useEffect } from 'react'
import { useManagementStore } from '~/providers/management-store-provider'
import { api } from '~/trpc/react'

import { refreshAction } from './RefreshAction'
import { SubmitButton } from '~/app/_components/SubmitButton'
import { useMounted } from '@mantine/hooks'

const UserSaveButton = () => {
    const { id }: { id: string } = useParams()
    const router = useRouter()
    const mounted = useMounted()


    const userPermissions = useManagementStore((state) => state.userPermissions)
    const permissionsChanged = useManagementStore((state) => state.permissionsChanged)
    const setPermissionsChanged = useManagementStore((state) => state.setPermissionsChanged)

    const staffChanged = useManagementStore((state) => state.staffChanged)
    const setStaffChanged = useManagementStore((state) => state.setStaffChanged)

    const adminChanged = useManagementStore((state) => state.adminChanged)
    const setAdminChanged = useManagementStore((state) => state.setAdminChanged)

    const staff = useManagementStore((state) => state.staff)
    const admin = useManagementStore((state) => state.admin)

    const limit = useManagementStore((state) => state.limit)
    const limitChanged = useManagementStore((state) => state.limitChanged)
    const setLimitChanged = useManagementStore((state) => state.setLimitChanged)

    const unsavedChanges = permissionsChanged || staffChanged || adminChanged || limitChanged


    const { mutate: updatePermissions, isPending: isUpdating, isSuccess: isUpdated, error: updateError } = api.management.updatePermissions.useMutation()
    const { mutate: updateStaff, isPending: isUpdatingStaff, isSuccess: isUpdatedStaff, error: updateErrorStaff } = api.management.updateStaffRole.useMutation()
    const { mutate: updateAdmin, isPending: isUpdatingAdmin, isSuccess: isUpdatedAdmin, error: updateErrorAdmin } = api.management.updateAdminRole.useMutation()

    const { mutate: updateLimit, isPending: isUpdatingLimit, isSuccess: isUpdatedLimit, error: updateErrorLimit } = api.management.updateQrLimit.useMutation()


    const loading = (isUpdating || isUpdatingStaff || isUpdatingAdmin || isUpdatingLimit) && !(updateError || updateErrorStaff || updateErrorAdmin || updateErrorLimit)


    const handleSave = () => {
        if (loading) return
        if (permissionsChanged) {
            updatePermissions({ permissions: userPermissions, id: id })
        }

        if (staffChanged) {
            updateStaff({ staff: !!staff, id: id })
        }

        if (adminChanged) {
            updateAdmin({ admin: !!admin, id: id })
        }

        if (limitChanged && limit) {
            updateLimit({ limit: typeof limit === "string" ? Number.parseInt(limit) : limit, id: id })
        }

    }


    useEffect(() => {
        if (isUpdated) {
            setPermissionsChanged(false)
        }

        if (isUpdatedStaff) {
            setStaffChanged(false)
        }

        if (isUpdatedAdmin) {
            setAdminChanged(false)
        }
        if (isUpdatedLimit) {
            setLimitChanged(false)
        }


    }, [isUpdated, setPermissionsChanged, isUpdatedStaff, setStaffChanged, isUpdatedAdmin, setAdminChanged, isUpdatedLimit, setLimitChanged])



    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!loading && mounted) {
            console.log("refreshing")
            router.refresh()
        }
    }, [loading, router])





    const refreshActionWithId = refreshAction.bind(null, id)


    return (
        <Group gap={5}>
            <ActionIcon
                className="data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed"
                loading={loading}
                onClick={handleSave}
                disabled={!unsavedChanges}
            >
                <FontAwesomeIcon icon={faSave} />
            </ActionIcon>
            <form action={refreshActionWithId}

            >
                <SubmitButton
                    variant='light'
                    className="data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed"
                >
                    <VisuallyHidden>Refresh</VisuallyHidden>
                    <FontAwesomeIcon icon={faArrowsRotate} />
                </SubmitButton>
            </form>
        </Group>
    )
}

export default UserSaveButton