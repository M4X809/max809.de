import React from 'react'
import { onPageAllowed } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { CodeHighlight } from '@mantine/code-highlight';

export default async function StaffDashboard() {
    await onPageAllowed("staff");
    const session = await getServerAuthSession();
    return (
        <div>
            <CodeHighlight
                className='rounded-lg'
                language="json"
                code={JSON.stringify(session, null, 2)}
            />
        </div>
    )
}

