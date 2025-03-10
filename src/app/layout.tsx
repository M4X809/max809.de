import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/dates/styles.css";
import "~/styles/globals.css";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppStoreProvider } from "~/providers/app-store-provider";
import { CSPostHogProvider } from "./providers";
import { QrCodeStoreProvider } from "~/providers/qr-code-provider";
import { theme } from "./theme";
import { Toaster } from "~/components/ui/sonner";
import CommandHandler from "./_components/CommandHandler";
import { getServerAuthSession } from "~/server/auth";
import { hasPermission } from "~/lib/sUtils";
import { ManagementStoreProvider } from "~/providers/management-store-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
	metadataBase: new URL("https://max809.de"),
	title: "max809.de",
	description: "The Homepage of @max809",
	icons: [{ rel: "icon", url: "/max809.webp" }],
};

new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "full" });

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getServerAuthSession();

	return (
		<html lang="de-DE" className={`${GeistSans.variable}`}>
			<head>
				<meta name="darkreader-lock" />
			</head>
			<body
				style={{
					background: "linear-gradient(to top, #06080f, #122b69)",
				}}
			>
				<CSPostHogProvider>
					<TRPCReactProvider>
						<MantineProvider
							defaultColorScheme="dark"
							forceColorScheme="dark"
							theme={theme}
						>
							<AppStoreProvider>
								<QrCodeStoreProvider>
									<ManagementStoreProvider>
										<ModalsProvider>
											<Toaster closeButton visibleToasts={5} pauseWhenPageIsHidden />
											{(await hasPermission("mainCommandWindow")) && (
												<CommandHandler
													session={session}
													keys={session?.user?.config?.global?.openCommandKey}
												/>
											)}
											<NuqsAdapter>{children}</NuqsAdapter>
										</ModalsProvider>
									</ManagementStoreProvider>
								</QrCodeStoreProvider>
							</AppStoreProvider>
						</MantineProvider>
					</TRPCReactProvider>
				</CSPostHogProvider>
			</body>
		</html>
	);
}
