

import { TRPCError } from '@trpc/server'
import React from 'react'
import ErrorBox from '~/app/_components/ErrorBox'
import { api } from '~/trpc/server'
import { CreateEntry } from '../ClientFeedComponents'
import { ActionIcon, Button, Card, Container, Group, Title } from '@mantine/core'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/pro-duotone-svg-icons'
import { onPageAllowed } from '~/lib/sUtils'

export default async function EditEntry({ params }: { params: { id: string } }) {
    await onPageAllowed("viewLogbookFeed")

    const data = await api.logbook.getEntryById({ id: params.id })

    if (data instanceof TRPCError) {
        return <ErrorBox
            value={data.message}
            visible={true}
        />
    }

    return (
        <Container size={"lg"}>
            <Card className='bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg'>
                <Group wrap='nowrap' justify="start"  >
                    <ActionIcon variant='filled'
                        size={'xl'}
                        className='bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white'
                        radius={"md"}
                        component={Link}
                        href={`/dashboard/logbook/feed?day=${data.date?.toLocaleDateString("de-DE")}`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} fontSize={30} color='white' />
                    </ActionIcon>
                    <Title order={2} >
                        Eintrag bearbeiten.
                    </Title>
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

