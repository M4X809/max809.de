
import { CubeStoreProvider } from "~/providers/cube-timer-provider";

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
