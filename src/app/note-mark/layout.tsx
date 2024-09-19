// export const metadata: Metadata = {
//     metadataBase: new URL('https://max809.de'),
//     title: "max809.de",
//     description: "The Homepage of @max809",
//     icons: [{ rel: "icon", url: "/max809.webp" }],

// };
"use client"
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider } from 'react-photo-view';

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <PhotoProvider>


                {children}
            </PhotoProvider>

        </>
    );
}
