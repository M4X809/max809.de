"use server"
import { faGit } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, Affix, VisuallyHidden } from '@mantine/core'
import Link from 'next/link'
import React from 'react'
import { getServerAuthSession } from '~/server/auth'

const ClearGhCache = async () => {
    const session = await getServerAuthSession()
    if (!session?.user.id) return null
    if (session?.user.name !== "max809") return null

    return (
        // <Affix position={{ bottom: 10, right: 10 }} >
        <ActionIcon
            component={Link}
            prefetch={false}
            href="/api/gh-stats/clear-cache"
            variant="light"
            className='self-center'
            rel='external'
            size="sm"
            title="Clear GitHub Stats Cache"
        >
            <VisuallyHidden>Clear GitHub Stats Cache</VisuallyHidden>
            <FontAwesomeIcon icon={faGit} />
        </ActionIcon>
        // {/* </Affix> */}
    )
}

export default ClearGhCache