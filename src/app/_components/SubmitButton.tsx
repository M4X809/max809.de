'use client'

import { ActionIcon, type ActionIconProps } from '@mantine/core'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ ...props }: ActionIconProps & { children?: React.ReactNode }) {
    const { pending } = useFormStatus()

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