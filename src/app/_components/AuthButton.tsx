"use client";

import { faSignInAlt, faSignOutAlt } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Text, Tooltip, TooltipFloating, type ButtonProps } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const AuthButton = ({
	session,
	onlySignIn = false,
	...props
}: {
	session: Session | null | undefined;
	onlySignIn?: boolean;
	props?: Omit<ButtonProps, "children" | "onClick" | "className" | "unstyled" | "tabIndex">;
}) => {
	const [confirmSignOut, setConfirmSignOut] = useState(false);
	const { start, clear } = useTimeout(() => {
		setConfirmSignOut(false);
	}, 3000);
	const posthog = usePostHog();
	if (onlySignIn && session?.user.id) return <></>;

	return (
		<Button
			tabIndex={-1}
			{...props}
			unstyled
			onClick={async () => {
				if (session) {
					if (confirmSignOut) {
						posthog.capture("sign-out", { distinctId: session.user.id });
						await signOut();
						clear();
					} else {
						start();
						setConfirmSignOut(true);
					}
				} else {
					await signIn();
				}
			}}
			className={twMerge(
				"h-full text-nowrap rounded-full bg-white/10 px-3 py-1 transition-colors duration-500 hover:bg-white/20 md:px-4 md:py-2",
				confirmSignOut ? "bg-blue-500 hover:bg-blue-500" : "",
			)}
		>
			<TooltipFloating
				label={session ? (confirmSignOut ? "Confirm Sign Out" : `Sign out: ${session.user?.name}`) : "Sign in"}
				position="left"
			>
				<Box>
					<Text className="hidden md:block" fw={600}>
						{session ? (confirmSignOut ? "Confirm Sign Out" : `Sign out: ${session.user?.name}`) : "Sign in"}
					</Text>
					<Text className="md:hidden" fw={600}>
						{session ? (
							confirmSignOut ? (
								"Confirm Sign Out"
							) : (
								<FontAwesomeIcon icon={faSignOutAlt} fixedWidth />
							)
						) : (
							<FontAwesomeIcon icon={faSignInAlt} fixedWidth />
						)}
					</Text>
				</Box>
			</TooltipFloating>
		</Button>
	);
};
