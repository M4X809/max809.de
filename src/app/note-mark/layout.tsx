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
