"use client";
import { useEffect, useRef } from "react";
import { QRCodeBrowser } from "@qrcode-js/browser";
import { useQrCodeStore } from "~/providers/qr-code-provider";
import { useDebouncedCallback } from '@mantine/hooks';
import { AspectRatio } from "@mantine/core";

const MyCanvas = ({ ...props }: React.HTMLAttributes<HTMLCanvasElement>) => {
    const qrCode = useQrCodeStore((state) => state.qrCode)
    const qrLvl = useQrCodeStore((state) => state.qrLvl);
    const size = useQrCodeStore((state) => state.size);

    const color = useQrCodeStore((state) => state.color);
    const backgroundColor = useQrCodeStore((state) => state.backgroundColor);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCanvasRef = useQrCodeStore((state) => state.setCanvasRef);
    const finderRadius = useQrCodeStore((state) => state.finderRadius);
    const dotRadius = useQrCodeStore((state) => state.dotRadius);

    const updateQrCode = useDebouncedCallback(async () => {
        if (!canvasRef.current) return;
        const myQR = QRCodeBrowser(canvasRef.current);

        myQR.setOptions({
            text: qrCode,
            qr: {
                maskPattern: 3,
                version: 0,
                correctLevel: qrLvl,
            },
            size: size,
            dots: {
                scale: 0.75,
                round: dotRadius,
            },
            finder: {
                round: finderRadius,
            },
            color: color,
            background: {
                colorBelow: backgroundColor,
            },
            drawFunction: "telegram",
        });
        myQR.draw();
    }, 100);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setCanvasRef(canvasRef);
    }, [setCanvasRef, canvasRef]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!canvasRef.current) return;
        updateQrCode();
    }, [canvasRef, qrCode, qrLvl, size, color, backgroundColor, finderRadius, dotRadius]);


    return (
        <AspectRatio h={"auto"} w={500} ratio={1 / 1} maw={500} >
            <canvas {...props} ref={canvasRef} />
        </AspectRatio>)
}

export default MyCanvas;