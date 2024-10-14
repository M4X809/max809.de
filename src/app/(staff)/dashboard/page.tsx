import React from 'react'
import { onPageAllowed } from '~/lib/sUtils';
import { getServerAuthSession } from '~/server/auth';
import { CodeHighlight } from '@mantine/code-highlight';
import { Container } from '@mantine/core';

export default async function StaffDashboard() {
    await onPageAllowed("staff");
    const session = await getServerAuthSession();
    return (
        <Container size={"md"} >
            <CodeHighlight
                className='rounded-lg'
                language="json"
                code={JSON.stringify(session, null, 2)}
            />
        </Container>
    )
}

