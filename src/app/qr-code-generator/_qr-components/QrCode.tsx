"use client";
import { useEffect, useRef } from "react";
import { QRCodeBrowser } from "@qrcode-js/browser";
import { useAppStore } from "~/providers/app-store-provider";
import { useDebouncedCallback } from '@mantine/hooks';
import { AspectRatio } from "@mantine/core";

const MyCanvas = ({ ...props }: React.HTMLAttributes<HTMLCanvasElement>) => {
    const qrCode = useAppStore((state) => state.qrCode)
    const qrLvl = useAppStore((state) => state.qrLvl);
    const size = useAppStore((state) => state.size);

    const color = useAppStore((state) => state.color);
    const backgroundColor = useAppStore((state) => state.backgroundColor);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCanvasRef = useAppStore((state) => state.setCanvasRef);
    const finderRadius = useAppStore((state) => state.finderRadius);
    const dotRadius = useAppStore((state) => state.dotRadius);

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