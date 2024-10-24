import { onPageAllowed } from "~/lib/sUtils"

export default async function LogbookDashboard() {
    await onPageAllowed("viewLogbook")


    return (
        <div>page</div>
    )
}

