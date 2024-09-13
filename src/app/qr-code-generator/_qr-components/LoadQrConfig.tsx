"use client"

import { faArrowUp } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, VisuallyHidden } from "@mantine/core"
import { useWindowScroll } from "@mantine/hooks"
import { z } from "zod"
// import { useQrStore } from "~/providers/app-store-provider"
import { useQrStore } from "~/stores/qr-store"

type data = {
    id: string; name: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date | null;
    qrCode: string | null;
    qrLvl: number | null;
    size: number | null;
    color: string | null;
    backgroundColor: string | null;
    finderRadius: number | null;
    dotRadius: number | null;
    dataUrl: string | null;
    shareable: boolean | null;
}

interface QrCodeData {
    data: data

}

const LoadQrConfig: React.FC<QrCodeData> = ({ data }) => {
    // All Setters
    const setSaveTitle = useQrStore((state) => state.setSaveTitle)
    const setQrCode = useQrStore((state) => state.setQrCode)
    const setQrLvl = useQrStore((state) => state.setQrLvl)
    const setSize = useQrStore((state) => state.setSize)
    const setColor = useQrStore((state) => state.setColor)
    const setBackgroundColor = useQrStore((state) => state.setBackgroundColor)
    const setFinderRadius = useQrStore((state) => state.setFinderRadius)
    const setDotRadius = useQrStore((state) => state.setDotRadius)
    const setDataUrl = useQrStore((state) => state.setDataUrl)
    const setShareable = useQrStore((state) => state.setShareable)

    const [scroll, scrollTo] = useWindowScroll();

    const loadQrConfig = (data: data) => {
        if (!data) return
        const code = data



        // const { data: code, success } = z.object({
        //     id: z.string(),
        //     name: z.string(),
        //     createdById: z.string(),
        //     createdAt: z.date(),
        //     updatedAt: z.date(),
        //     qrCode: z.string(),
        //     qrLvl: z.number(),
        //     size: z.number(),
        //     color: z.string(),
        //     backgroundColor: z.string(),
        //     finderRadius: z.number(),
        //     dotRadius: z.number(),
        //     dataUrl: z.string().optional().default(""),
        //     shareable: z.boolean().optional().default(false),
        // }).safeParse(data)

        // if (!success) return




        if (code?.name) setSaveTitle(code.name)
        if (code?.qrCode) setQrCode(code.qrCode)
        if (code?.qrLvl) setQrLvl(`${code.qrLvl}`)
        if (code?.size) setSize(code.size)
        if (code?.color) setColor(code.color)
        if (code?.backgroundColor) setBackgroundColor(code.backgroundColor)
        if (code?.finderRadius) setFinderRadius(code.finderRadius)
        if (code?.dotRadius) setDotRadius(code.dotRadius)
        if (code?.dataUrl) setDataUrl(code.dataUrl)
        if (code?.shareable) setShareable(code.shareable)
        // setQrLvl(`${code.qrLvl}`)
        // setSize(code.size)
        // setColor(code.color)
        // setBackgroundColor(code.backgroundColor)
        // setFinderRadius(code.finderRadius)
        // setDotRadius(code.dotRadius)
        // setDataUrl(code.dataUrl)
        // setShareable(code.shareable)#
        console.log(code)
        return
    }


    return (
        <ActionIcon
            // bg={"rgba(255,255,255,0.1)"}
            variant="light"
            title="Load QR Config"
            onClick={() => {
                loadQrConfig(data)
                scrollTo({ y: 0 })
            }}
        >
            <VisuallyHidden>Load QR Config</VisuallyHidden>
            <FontAwesomeIcon icon={faArrowUp} />

        </ActionIcon>
    )
}



export default LoadQrConfig