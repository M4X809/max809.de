"use server"
import { faGit } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionIcon, VisuallyHidden } from '@mantine/core'
import Link from 'next/link'
import React from 'react'
import { onPageAllowed } from '~/lib/utils'

const ClearGhCache = async () => {
    await onPageAllowed()



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