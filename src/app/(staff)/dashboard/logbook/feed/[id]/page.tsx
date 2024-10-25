

import { TRPCError } from '@trpc/server'
import React from 'react'
import ErrorBox from '~/app/_components/ErrorBox'
import { api } from '~/trpc/server'
import { CreateEntry, DeleteEntryButton } from '../ClientFeedComponents'
import { ActionIcon, Box, Button, Card, Container, Group, Title } from '@mantine/core'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/pro-duotone-svg-icons'
import { onPageAllowed } from '~/lib/sUtils'

export default async function EditEntry({ params }: { params: Promise<{ id: string }> }) {
    await onPageAllowed("viewLogbookFeed")
    const { id } = await params

    const data = await api.logbook.getEntryById({ id })

    if (data instanceof TRPCError) {
        return <ErrorBox
            value={data.message}
            visible={true}
        />
    }

    return (
        <Container size={"lg"}>
            <Card className='bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg'>
                <Group justify='space-between' wrap='nowrap' align="baseline">
                    <ActionIcon variant='filled'
                        size={'lg'}
                        className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
                        radius={"md"}
                        component={Link}
                        href={`/dashboard/logbook/feed?day=${data.date?.toLocaleDateString("de-DE")}`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} fontSize={22} color='white' />
                    </ActionIcon>
                    <Title order={3} className='truncate' >
                        Eintrag bearbeiten.
                    </Title>
                    <Box>
                        <DeleteEntryButton
                            id={data.id}
                            dateString={data.date?.toLocaleDateString("de-DE")}
                        />
                    </Box>
                </Group>
                <CreateEntry
                    streetNames={data.previousStreetNames}
                    initialValues={data}
                    entryId={data.id}
                />
            </Card>
        </Container>
    )
}

