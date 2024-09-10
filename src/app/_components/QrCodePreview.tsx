"use client"
import { AspectRatio, Box, type StyleProp } from "@mantine/core";
import { type AwesomeQR, QRCodeBrowser } from "@qrcode-js/browser";
import { useEffect, useRef } from "react";
import { z } from "zod"


export type QrCodeData = {
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
}



export interface QrCodePreviewProps {
    data: QrCodeData
    w?: StyleProp<React.CSSProperties['width']>
}




export const QrCodePreview: React.FC<QrCodePreviewProps> = ({ data, w }) => {

    const code = z.object({
        id: z.string(),
        name: z.string(),
        createdById: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
        qrCode: z.string(),
        qrLvl: z.number(),
        size: z.number(),
        color: z.string(),
        backgroundColor: z.string(),
        finderRadius: z.number(),
        dotRadius: z.number(),
    })

        .safeParse(data)

    if (!code.success || code.error) return <Box>Error Creating preview</Box>

    const { id, name, createdById, createdAt, updatedAt, qrCode, qrLvl, size, color, backgroundColor, finderRadius, dotRadius } = code.data





    const canvasRef = useRef<HTMLCanvasElement>(null);
    let myQR: AwesomeQR<HTMLCanvasElement>
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!canvasRef.current || !code.success) return
        myQR = QRCodeBrowser(canvasRef.current);

        myQR.setOptions({
            text: qrCode,
            color: color,
            background: {
                colorBelow: backgroundColor,
            },
            qr: {
                correctLevel: qrLvl,
                version: 0,
                maskPattern: 11

            },

            dots: {
                round: dotRadius,
            },
            finder: {
                round: finderRadius,
            },
            size: 256,
        })

        myQR.draw();



    }, [])

    return (

        <AspectRatio h={"auto"} w={w ?? 100} ratio={1 / 1} maw={w ?? 100} >
            <canvas style={{ height: "auto", maxWidth: "100%", width: "100%" }} ref={canvasRef} />
        </AspectRatio>
    )
}

export default QrCodePreview