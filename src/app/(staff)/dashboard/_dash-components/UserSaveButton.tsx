"use client"
import { faSave } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon } from '@mantine/core'
import { useParams, useRouter, } from 'next/navigation'
import React, { useEffect } from 'react'
import { useManagementStore } from '~/providers/management-store-provider'
import { api } from '~/trpc/react'

const UserSaveButton = () => {
    const { id }: { id: string } = useParams()
    const router = useRouter()


    const userPermissions = useManagementStore((state) => state.userPermissions)
    const permissionsChanged = useManagementStore((state) => state.permissionsChanged)
    const setPermissionsChanged = useManagementStore((state) => state.setPermissionsChanged)
    const unsavedChanges = permissionsChanged


    const { mutate: updatePermissions, isPending: isUpdating, isSuccess: isUpdated, error: updateError } = api.management.updatePermissions.useMutation()
    const loading = (isUpdating) && !(updateError)


    const handleSave = () => {
        if (isUpdating) return
        if (permissionsChanged) {
            updatePermissions({ permissions: userPermissions, id: id })
        }
    }


    useEffect(() => {
        if (isUpdated) {
            setPermissionsChanged(false)
            router.refresh()
        }
    }, [isUpdated, setPermissionsChanged, router])








    return (
        <ActionIcon
            loading={loading}
            onClick={handleSave}
            disabled={!unsavedChanges}
        >
            <FontAwesomeIcon icon={faSave} />
        </ActionIcon>
    )
}

export default UserSaveButton