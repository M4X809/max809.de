// "use client"
import type React from 'react';
import '@mantine/code-highlight/styles.css';

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
        </>
    );
}
