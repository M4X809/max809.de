"use client"

import { faArrowUp } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, type ActionIconProps, VisuallyHidden } from "@mantine/core"
import { useWindowScroll } from "@mantine/hooks"
// import { z } from "zod"
import { useAppStore } from "~/providers/app-store-provider"

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
    // props?: ActionIconProps[]

}
const LoadQrConfig = ({ data, ...props }: ActionIconProps & QrCodeData) => {

    const setSaveTitle = useAppStore((state) => state.setSaveTitle)
    const setQrCode = useAppStore((state) => state.setQrCode)
    const setQrLvl = useAppStore((state) => state.setQrLvl)
    const setSize = useAppStore((state) => state.setSize)
    const setColor = useAppStore((state) => state.setColor)
    const setBackgroundColor = useAppStore((state) => state.setBackgroundColor)
    const setFinderRadius = useAppStore((state) => state.setFinderRadius)
    const setDotRadius = useAppStore((state) => state.setDotRadius)
    const setDataUrl = useAppStore((state) => state.setDataUrl)
    const setShareable = useAppStore((state) => state.setShareable)

    const [_scroll, scrollTo] = useWindowScroll();

    const loadQrConfig = (data: data) => {
        if (!data) return
        const code = data

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
        return
    }

    return (
        <ActionIcon
            title="Load QR Config"
            {...props}
            onClick={() => {
                console.log("data", data)
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