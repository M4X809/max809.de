// "use client"
import "react-photo-view/dist/react-photo-view.css";
import type React from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
