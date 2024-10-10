"use client"
import { faSave } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon } from '@mantine/core'
import { useParams, useRouter, } from 'next/navigation'
import React, { useEffect } from 'react'
import { set } from 'zod'
import { useManagementStore } from '~/providers/management-store-provider'
import { api } from '~/trpc/react'

const UserSaveButton = () => {
    const { id }: { id: string } = useParams()
    const router = useRouter()


    const userPermissions = useManagementStore((state) => state.userPermissions)
    const permissionsChanged = useManagementStore((state) => state.permissionsChanged)
    const setPermissionsChanged = useManagementStore((state) => state.setPermissionsChanged)

    const staffChanged = useManagementStore((state) => state.staffChanged)
    const setStaffChanged = useManagementStore((state) => state.setStaffChanged)

    const adminChanged = useManagementStore((state) => state.adminChanged)
    const setAdminChanged = useManagementStore((state) => state.setAdminChanged)

    const staff = useManagementStore((state) => state.staff)

    const admin = useManagementStore((state) => state.admin)

    const unsavedChanges = permissionsChanged || staffChanged || adminChanged


    const { mutate: updatePermissions, isPending: isUpdating, isSuccess: isUpdated, error: updateError } = api.management.updatePermissions.useMutation()
    const { mutate: updateStaff, isPending: isUpdatingStaff, isSuccess: isUpdatedStaff, error: updateErrorStaff } = api.management.updateStaffRole.useMutation()
    const { mutate: updateAdmin, isPending: isUpdatingAdmin, isSuccess: isUpdatedAdmin, error: updateErrorAdmin } = api.management.updateAdminRole.useMutation()


    const loading = (isUpdating || isUpdatingStaff || isUpdatingAdmin) && !(updateError || updateErrorStaff || updateErrorAdmin)


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

    }, [isUpdated, setPermissionsChanged, isUpdatedStaff, setStaffChanged, isUpdatedAdmin, setAdminChanged])



    useEffect(() => {
        if (!loading) {
            router.refresh()
        }
    }, [loading, router])








    return (
        <ActionIcon
            className="data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed"
            loading={loading}
            onClick={handleSave}
            disabled={!unsavedChanges}
        >
            <FontAwesomeIcon icon={faSave} />
        </ActionIcon>
    )
}

export default UserSaveButton