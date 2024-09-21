
import { CubeStoreProvider } from "~/providers/cube-timer-provider";
import localFont from 'next/font/local'

export const lcdFont = localFont({
    src: '../../../public/G7_Segment_7a.ttf',
    preload: true,
    display: 'swap',
    variable: '--font-lcd',
})


export default function CubeTimerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {/* <div className={lcdFont.className} > */}

            <CubeStoreProvider>
                {children}
            </CubeStoreProvider>
            {/* </div> */}

        </>
    );
}
