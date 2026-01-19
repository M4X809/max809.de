"use client";

import { faArrowUpRightFromSquare, faTrashCan } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Group, Box, ActionIcon, VisuallyHidden, Tooltip, Text } from "@mantine/core";
import { twMerge } from "tailwind-merge";
import LoadQrConfig from "./LoadQrConfig";
import { useClipboard } from "@mantine/hooks";
import { useState } from "react";
import { useQrCodeStore } from "~/providers/qr-code-provider";

export const PreviewButtons = ({ code, baseURL }: { code: any; baseURL: string }) => {
	const { copied, copy } = useClipboard({ timeout: 500 });
	const [copiedName, setCopiedName] = useState<string | null>(null);

	const setDeleteCodeId = useQrCodeStore((state) => state.setDeleteCodeId);
	const setDeleteName = useQrCodeStore((state) => state.setDeleteName);
	const setDeleteToggle = useQrCodeStore((state) => state.setDeleteToggle);
	return (
		<Group wrap="nowrap">
			<Tooltip
				c={"white"}
				transitionProps={{ transition: "fade" }}
				classNames={{
					tooltip: "bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white",
				}}
				label={<Text fz={14}>Load QR Code</Text>}
			>
				<Box>
					<LoadQrConfig data={code} variant="light" />
				</Box>
			</Tooltip>
			<Tooltip
				c={"white"}
				w={200}
				maw={"100dvw"}
				styles={{
					tooltip: {
						wordBreak: "break-word",
						textWrap: "wrap",
					},
				}}
				events={{ hover: true, focus: true, touch: !code.shareable }}
				transitionProps={{ transition: "fade" }}
				classNames={{
					tooltip: "bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white ",
				}}
				label={
					<Box>
						{code.shareable && <Text fz={14}>Share QR Code</Text>}
						{!code.shareable && (
							<Text fz={14}>
								{" "}
								This QR Code is not shareable. <br />
								Use the arrow button to load it into the QR Code Generator, then save it with sharing enabled.
							</Text>
						)}
					</Box>
				}
			>
				<Box>
					<ActionIcon
						className={twMerge(
							"transition-colors duration-500",
							copied && copiedName === code.name && code.shareable
								? "bg-green-800 text-green-200 hover:bg-green-800 hover:text-green-200"
								: "",
						)}
						variant="light"
						disabled={!code.shareable}
						onClick={() => {
							setCopiedName(code.name);
							let url = `${baseURL}/r/qr/${code.id}`;
							if (!url.startsWith("https://") && !url.startsWith("http://")) url = `https://${url}`;
							copy(`${baseURL}/r/qr/${code.id}`);
						}}
					>
						<VisuallyHidden>Share QR Code</VisuallyHidden>
						<FontAwesomeIcon icon={faArrowUpRightFromSquare} />
					</ActionIcon>
				</Box>
			</Tooltip>
			<Tooltip
				c={"white"}
				label="Delete QR Code"
				classNames={{
					tooltip: "bg-gradient-to-tr from-[darkred] to-[darkorange] text-white ",
				}}
				transitionProps={{ transition: "fade" }}
			>
				<Box>
					<ActionIcon
						variant="light"
						color={"red"}
						onClick={() => {
							setDeleteCodeId(code.id);
							setDeleteName(code.name);
							setDeleteToggle();
						}}
					>
						<VisuallyHidden>Delete QR Code</VisuallyHidden>
						<FontAwesomeIcon icon={faTrashCan} />
					</ActionIcon>
				</Box>
			</Tooltip>
		</Group>
	);
};
