import { permanentRedirect, RedirectType } from "next/navigation";

export default async function QrCodeGeneratorRedirect() {
    permanentRedirect("/qr-code-generator", RedirectType.replace)
}