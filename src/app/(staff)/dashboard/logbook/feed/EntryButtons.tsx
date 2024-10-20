"use client"
import { faTrashCan } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Button } from '@mantine/core'
import React from 'react'
import { api } from '~/trpc/react'

export const EntryButtons = ({ id }: { id: string }) => {
    const { mutate: deleteEntry, isPending: isDeleting, isSuccess: isDeleteSuccess, error: deleteError, reset: resetDeleteMutation } = api.logbook.deleteEntry.useMutation()


    return (
        <ActionIcon
            variant='light'
            className='text-slate-500 hover:text-slate-400'
            onClick={() => {
                deleteEntry({ id: id })
            }}
            loading={isDeleting}
            disabled={isDeleting}
        >
            <FontAwesomeIcon icon={faTrashCan} />

        </ActionIcon>
    )
}

