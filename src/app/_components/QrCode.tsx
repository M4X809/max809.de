"use client";
import { useEffect, useRef } from "react";
import { AwesomeQR, QRCodeBrowser } from "@qrcode-js/browser";
import { useAppStore } from "~/providers/app-store-provider";
import { useDebouncedCallback } from '@mantine/hooks';
import { AspectRatio } from "@mantine/core";
// interface MyCanvasProps {
//    props: 
// }


const MyCanvas = ({ ...props }: React.HTMLAttributes<HTMLCanvasElement>) => {
    const qrCode = useAppStore((state) => state.qrCode)
    const qrLvl = useAppStore((state) => state.qrLvl);
    const size = useAppStore((state) => state.size);

    const color = useAppStore((state) => state.color);
    const backgroundColor = useAppStore((state) => state.backgroundColor);

    // const setDownloading = useAppStore((state) => state.setDownloading);
    // const canvasState = useAppStore((state) => state.canvasState);
    const setCanvasState = useAppStore((state) => state.setCanvasState);


    // const workerRef = useRef<Worker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // const hasTransferred = useRef<boolean>(false);
    const setCanvasRef = useAppStore((state) => state.setCanvasRef);


    const finderRadius = useAppStore((state) => state.finderRadius);

    const dotRadius = useAppStore((state) => state.dotRadius);


    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //     if (hasTransferred.current) return; // Prevent re-transfer

    //     const offscreen = canvas.transferControlToOffscreen();
    //     hasTransferred.current = true; // Mark the canvas as transferred

    //     const worker = new Worker(new URL('../public/canvas-worker.js', import.meta.url));
    //     workerRef.current = worker;

    //     const initializeQrCode = async () => {
    //         const qrCanvas = document.createElement('canvas');
    //         qrCanvas.width = 512;
    //         qrCanvas.height = 512;

    //         const qr = new AwesomeQR(canvas, qrCanvas, )


    //         await qr.draw();

    //         worker.postMessage({ canvas: offscreen, qrDataUrl: qrCanvas.toDataURL(), width: 512, height: 512 }, [offscreen]);
    //     };

    //     initializeQrCode();

    //     const handleResize = () => {
    //         const width = window.innerWidth;
    //         const height = window.innerHeight;

    //         worker.postMessage({ canvas: offscreen, width, height }, [offscreen]);
    //     };

    //     window.addEventListener('resize', handleResize);

    //     return () => {
    //         worker.terminate();
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }, []);

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
    }, 500);




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