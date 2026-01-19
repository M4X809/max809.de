"use client";

import {
	AppShell,
	type AppShellProps,
	Box,
	Button,
	Dialog,
	Group,
	Stack,
	Text,
	Title,
	TooltipFloating,
} from "@mantine/core";
import type { SessionType } from "next-auth";
import React, { useEffect } from "react";
import { useAppStore } from "~/providers/app-store-provider";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faGearComplex, faHeart, faHome, faScrewdriverWrench } from "@fortawesome/pro-duotone-svg-icons";

import pkg from "~/../package.json";
import { usePostHog } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { trackingStore } from "~/stores/tracking-store";
import { AuthButton } from "./AuthButton";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useDidUpdate, useMounted, useOs } from "@mantine/hooks";
import { PhotoProvider } from "react-photo-view";
import { useIsStaff } from "../../lib/cUtils";
import ErrorBox from "./ErrorBox";

function Shell({
	children,
	session,
	title = "SetMe",
	redirect = false,
	withLoginButton = true,
	withDashboardButton = true,
	withHomeButton = false,
	withSettingsButton = false,
	forceHideHeader = false,
	...props
}: Omit<AppShellProps, "padding" | "navbar"> & {
	session?: SessionType;
	title?: string;
	redirect?: string | boolean;
	/**
	 * @default true
	 */
	withLoginButton?: boolean;
	/**
	 * @default true
	 */
	withDashboardButton?: boolean;
	/**
	 * @default false
	 */
	withHomeButton?: boolean;
	/**
	 * @default false
	 */
	withSettingsButton?: boolean;
	/**
	 * Forces the header to be hidden
	 * @default false
	 */
	forceHideHeader?: boolean;
}) {
	const posthog = usePostHog();
	const path = usePathname();
	const os = useOs();

	const isStaff = useIsStaff(session);

	posthog.capture("page_view", { path: path });

	const trackingBanner = trackingStore((state) => state.trackingBanner);
	const setTrackingBanner = trackingStore((state) => state.setTrackingBanner);

	const setOs = useAppStore((state) => state.setOs);

	const _hideHeader = useAppStore((state) => state.hideHeader);
	const hideHeader = forceHideHeader || _hideHeader;

	const setSession = useAppStore((state) => state.setSession);

	// const debugPosthog = false
	const debugPosthog = posthog.isFeatureEnabled("debug-posthog", {
		send_event: true,
	});

	useEffect(() => {
		if (!session) return;
		setSession(session);
		posthog.identify(session?.user?.id, {
			name: session?.user?.name,
			email: session?.user?.email,
			id: session?.user?.id,
			whitelistId: session?.user?.whiteListId,
		});
	}, [session, setSession, posthog]);

	useEffect(() => {
		if (os === "undetermined") return;
		setOs(os);
	}, [os, setOs]);

	useEffect(() => {
		if (debugPosthog) {
			posthog.debug(true);
		} else {
			if (window.localStorage.getItem("ph_debug") === "true") {
				posthog.debug(false);
			}
		}
	}, [posthog.debug, debugPosthog]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		window.addEventListener("beforeunload", () => {
			posthog.debug(false);
			window.localStorage.setItem("ph_debug", "false");
		});

		return () => {
			window.removeEventListener("beforeunload", () => {
				posthog.debug(false);
				window.localStorage.setItem("ph_debug", "false");
			});
		};
	}, []);

	return (
		<>
			<PhotoProvider>
				<Box
					className="z-1 relative mb-[calc(2rem*var(--mantine-scale))] min-h-[calc(100vh-40px)] w-[-webkit-fill-available] bg-gradient-to-tr from-[#06080f] to-[#122b69]"
					style={{
						zIndex: "1",
					}}
				>
					<div className="z-1 flex min-h-screen min-w-full flex-col justify-center bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white">
						<AppShell
							navbar={{
								width: 300,
								breakpoint: "sm",
								collapsed: { mobile: true, desktop: true },
							}}
							padding={{ base: 0, md: "md" }}
							{...props}
						>
							<AppShell.Main className="flex h-full w-full flex-col" px={{ base: 0, md: undefined }}>
								{/* {!timerRunning &&  */}
								<Group
									wrap="nowrap"
									justify="space-between"
									align="center"
									className={twMerge("select-none transition-opacity duration-500", hideHeader && "opacity-0")}
								>
									<Stack gap={0}>
										{!!redirect && (
											<Link href={redirect.toString()}>
												<Title>{title}</Title>
											</Link>
										)}
										{!redirect && <Title>{title}</Title>}
									</Stack>
									<Group wrap="nowrap" justify="end" gap={1}>
										{withLoginButton && <AuthButton session={session} />}
										{withSettingsButton && session && (
											<TooltipFloating label="Account Settings" position="left">
												<Link
													href={"/"}
													className={twMerge(
														"h-full text-nowrap rounded-full bg-white/10 px-3 py-1 transition-colors duration-500 hover:bg-white/20 md:px-4 md:py-2",
													)}
												>
													<FontAwesomeIcon icon={faGearComplex} fixedWidth />
												</Link>
											</TooltipFloating>
										)}
										{withDashboardButton && isStaff() && !withHomeButton && (
											<Link
												href={"/dashboard"}
												className={twMerge(
													"h-full text-nowrap rounded-full bg-white/10 px-3 py-1 transition-colors duration-500 hover:bg-white/20 md:px-4 md:py-2",
												)}
											>
												<FontAwesomeIcon icon={faScrewdriverWrench} fixedWidth />
											</Link>
										)}

										{withHomeButton && isStaff() && !withDashboardButton && (
											<Link
												href={"/"}
												className={twMerge(
													"h-full text-nowrap rounded-full bg-white/10 px-3 py-1 transition-colors duration-500 hover:bg-white/20 md:px-4 md:py-2",
												)}
											>
												<FontAwesomeIcon icon={faHome} fixedWidth />
											</Link>
										)}

										{withDashboardButton && withHomeButton && isStaff() && (
											<ErrorBox value={"You can not have both the Dashboard and Home Button enabled."} visible={true} />
										)}
									</Group>
								</Group>
								{/* // } */}
								{children}
							</AppShell.Main>
						</AppShell>
					</div>
				</Box>
				<Box
					style={{ zIndex: "revert-layer" }}
					className="fixed bottom-0 left-0 right-0 z-0 h-[calc(2rem*var(--mantine-scale))] bg-gradient-to-br from-[#06080f] to-[#122b69]"
				>
					<Group h={"100%"} align="center" justify="space-between" px={10}>
						<Text c={"dimmed"} fz={13}>
							Made with{" "}
							<Text component="span" c={"#ff0000"}>
								{" "}
								<FontAwesomeIcon icon={faHeart} />
							</Text>{" "}
							by{" "}
							<Text fz={13} c={"blue"} component="a" href="https://github.com/m4x809" target="_blank" td={"underline"}>
								@M4X809
							</Text>
						</Text>
						<Text fz={13} c={"dimmed"} component="span">
							{" "}
							Version: {pkg.version}{" "}
						</Text>
						<Text
							c={"dimmed"}
							ta={"right"}
							fz={13}
							component="a"
							target="_blank"
							href="https://github.com/m4x809/max809.de"
							td={"underline"}
						>
							Source code on{" "}
							<Text c={"blue"} component="span" px={3}>
								<FontAwesomeIcon color="white" icon={faGithub} />
							</Text>
						</Text>
					</Group>
				</Box>
				<Dialog
					transitionProps={{ transition: "slide-left", duration: 500 }}
					w={600}
					className="bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white"
					withBorder
					opened={trackingBanner}
					withCloseButton
					onClose={() => setTrackingBanner(false)}
					size="lg"
					radius="md"
				>
					<Text size="sm" mb="xs" fw={500}>
						Cookies and Analytics
					</Text>
					<Text fz={13} mb="xs">
						This website uses cookies and analytics to improve your experience and are necessary for the website to function
						properly. <br /> By using this website, you agree to the use of cookies and analytics.
					</Text>
					<Button onClick={() => setTrackingBanner(false)} fullWidth size="compact-xs">
						OK
					</Button>
				</Dialog>
			</PhotoProvider>
		</>
	);
}

export default Shell;
