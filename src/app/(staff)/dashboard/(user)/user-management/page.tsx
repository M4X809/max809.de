import React from 'react'

import { onPageAllowed } from '~/lib/utils'

export default async function UserManagement() {
    await onPageAllowed(["userManagement"])


    return (
        <div>page</div>
    )
}
