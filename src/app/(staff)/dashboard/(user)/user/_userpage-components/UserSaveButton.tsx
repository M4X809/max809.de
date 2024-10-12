"use client"
import { faArrowsRotate, faSave, faX } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Box, Button, Group, Stack, Text, VisuallyHidden } from '@mantine/core'
import { useParams, useRouter, } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useManagementStore } from '~/providers/management-store-provider'
import { api } from '~/trpc/react'

import { refreshAction } from './RefreshAction'
import { SubmitButton } from '~/app/_components/SubmitButton'
import { useMounted } from '@mantine/hooks'
import { toast } from 'sonner'
import { DismissButton } from '~/components/ui/sonner'

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


    const [errorOject, setErrorOject] = useState<{ updateError?: any, updateErrorAdmin?: any, updateErrorLimit?: any, updateErrorStaff?: any }>({})

    const unsavedChanges = permissionsChanged || staffChanged || adminChanged || limitChanged


    const { mutate: updatePermissions, isPending: isUpdating, isSuccess: isUpdated, error: updateError, reset: resetPermissionsMutation, isError: isPermissionsError } = api.management.updatePermissions.useMutation()
    const { mutate: updateStaff, isPending: isUpdatingStaff, isSuccess: isUpdatedStaff, error: updateErrorStaff, reset: resetStaffMutation, isError: isStaffError } = api.management.updateStaffRole.useMutation()
    const { mutate: updateAdmin, isPending: isUpdatingAdmin, isSuccess: isUpdatedAdmin, error: updateErrorAdmin, reset: resetAdminMutation, isError: isAdminError } = api.management.updateAdminRole.useMutation()
    const { mutate: updateLimit, isPending: isUpdatingLimit, isSuccess: isUpdatedLimit, error: updateErrorLimit, reset: resetLimitMutation, isError: isLimitError } = api.management.updateQrLimit.useMutation()

    const loading = (isUpdating || isUpdatingStaff || isUpdatingAdmin || isUpdatingLimit) && !(updateError || updateErrorStaff || updateErrorAdmin || updateErrorLimit)
    const hasError = (isPermissionsError || isStaffError || isAdminError || isLimitError) && !loading


    const errorKeys = {
        updateError: "Update Permissions",
        updateErrorAdmin: "Update Role",
        updateErrorLimit: "Update Qr Limit ",
        updateErrorStaff: "Update Role",
    }

    useEffect(() => {
        return () => {
            toast.dismiss("saving-failed")
        }
    }, [])




    const handleSave = () => {
        if (loading) return
        toast.dismiss("saving-failed")
        resetPermissionsMutation()
        resetStaffMutation()
        resetAdminMutation()
        resetLimitMutation()


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
        if (loading || !hasError) return

        const errObj = {
            updateError: updateError,
            updateErrorAdmin: updateErrorAdmin,
            updateErrorLimit: updateErrorLimit,
            updateErrorStaff: updateErrorStaff,
        }

        const filtered = Object.fromEntries(Object.entries(errObj).filter(([_, value]) => value !== undefined && value !== null))
        if (Object.keys(filtered).length === 0) return setErrorOject({})

        const errorStack = Object.fromEntries(Object.entries(filtered).map(([key, value]) => {



            if (value?.message.toLowerCase().includes("max809")) {
                setTimeout(() => {
                    router.refresh()
                }, 3000)

                return [key, value?.message]
            }
            if (value?.message.toLowerCase().includes("admin")) {
                return [key, "Can't edit Admins."]
            }

            if (value?.message.toLowerCase().includes("self")) {
                return [key, "Can't edit Self."]
            }


            return [key, value?.message]
        }))
        // console.log("errorStack", errorStack)
        setErrorOject(errorStack)
    }, [updateError, updateErrorAdmin, updateErrorLimit, updateErrorStaff, loading, hasError, router])

    useEffect(() => {

        if (Object.keys(errorOject).length === 0 || loading) return
        // toast.dismiss("saving-failed")
        if (!hasError) return



        console.log("TOAST", errorOject)
        toast.error("Saving Failed.", {
            id: "saving-failed",
            cancel: <DismissButton id="saving-failed" />,
            description: (
                <Box>
                    {Object.keys(errorOject).map((key) => (
                        <Stack key={key} gap={0}>
                            <Text c={"inherit"} fz={15} >
                                {errorKeys[key as keyof typeof errorKeys]}
                            </Text>
                            <Text c={"inherit"} fz={13} >
                                {errorOject[key as keyof typeof errorOject]}
                            </Text>
                        </Stack>
                    ))}
                </Box>
            ),

            duration: 15 * 1000,
        })


    }, [errorOject, loading, hasError])





    useEffect(() => {
        if (isUpdated) {
            setPermissionsChanged(false)
            setErrorOject((state) => ({ ...state, updateError: undefined }))

        }

        if (isUpdatedStaff) {
            setStaffChanged(false)
            setErrorOject((state) => ({ ...state, updateErrorStaff: undefined }))
        }

        if (isUpdatedAdmin) {
            setAdminChanged(false)
            setErrorOject((state) => ({ ...state, updateErrorAdmin: undefined }))
        }
        if (isUpdatedLimit) {
            setLimitChanged(false)
            setErrorOject((state) => ({ ...state, updateErrorLimit: undefined }))
        }


    }, [isUpdated, setPermissionsChanged, isUpdatedStaff, setStaffChanged, isUpdatedAdmin, setAdminChanged, isUpdatedLimit, setLimitChanged])



    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!loading && mounted && !hasError) {
            console.log("refreshing")
            router.refresh()
            toast.dismiss("saving-failed")
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
            <form action={refreshActionWithId}>
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