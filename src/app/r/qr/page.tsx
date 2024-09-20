import { redirect, RedirectType } from "next/navigation";

export default async function QrCodeGeneratorRedirect() {
    redirect("/qr-code-generator", RedirectType.replace)
}