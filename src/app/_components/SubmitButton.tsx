'use client'

import { ActionIcon, type ActionIconProps } from '@mantine/core'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useManagementStore } from '~/providers/management-store-provider'

export function SubmitButton({ ...props }: Omit<ActionIconProps, "children" | "type" | "loading"> & { children?: React.ReactNode }) {
    const { pending } = useFormStatus()
    const setRefreshing = useManagementStore((state) => state.setRefreshing)


    useEffect(() => {
        setRefreshing(pending)
    }, [pending, setRefreshing])



    return (
        <ActionIcon
            {...props}
            loading={pending}
            type="submit"
        >
            {props.children}
        </ActionIcon>
    )
}