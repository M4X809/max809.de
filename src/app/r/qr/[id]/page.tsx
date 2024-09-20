import { permanentRedirect } from "next/navigation"

interface Props {
    params: {
        id: string
    }
}
export default async function QRCodeGeneratorRedirect({ params }: Props) {
    if (!params.id) {
        permanentRedirect("/qr-code-generator")
    }
    return permanentRedirect(`/qr-code-generator/${params.id}`)
}