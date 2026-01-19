"use client";
import type React from "react";
import { use, useEffect, useState } from "react";
import QrCodePreview from "./QrCodePreview";
import {
	ActionIcon,
	Box,
	Button,
	Container,
	Group,
	Modal,
	Paper,
	Pill,
	Skeleton,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { api } from "~/trpc/react";
import { useQrCodeStore } from "~/providers/qr-code-provider";
import { useClipboard, useDisclosure } from "@mantine/hooks";

import LoadQrConfig from "./LoadQrConfig";
import { faArrowUpRightFromSquare, faTrashCan } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { PreviewButtons } from "./PreviewButtons";

interface QrCodePreviewContainerProps {
	codes: {
		id: string;
		name: string | null;
		createdById: string;
		createdAt: Date;
		updatedAt: Date | null;
		qrCode: string | null;
		qrLvl: number | null;
		size: number | null;
		color: string | null;
		backgroundColor: string | null;
		finderRadius: number | null;
		dotRadius: number | null;
		dataUrl: string | null;
		shareable: boolean | null;
		imageKey: string | null;
	}[];
	limits: { current: number; max: number };
	userId: string;
	baseURL: string;
}

// const DateElement = (code:any) => {
//     if (!code.createdById) return <Text c={"dimmed"}>Unknown</Text>
//     const date = new Date(code.updatedAt as any)
//     return <Text component='span' c={"dimmed"}>{date.toLocaleTimeString("de-DE")}</Text>
// }

const QrCodePreviewContainer: React.FC<QrCodePreviewContainerProps> = ({ codes, limits, userId, baseURL }) => {
	const { data, isLoading, isError, refetch } = api.codes.getQrCodes.useQuery(undefined, {
		initialData: { codes, limits },
		enabled: !!userId,
	});

	const {
		mutate: deleteCode,
		isPending: isDeleting,
		isError: isDeleteError,
		isSuccess: isDeleteSuccess,
		error: deleteError,
		reset,
	} = api.codes.deleteQrCode.useMutation();

	const refetchCodes = useQrCodeStore((state) => state.refetchCodes);

	const opened = useQrCodeStore((state) => state.deleteToggle);
	const setDeleteToggle = useQrCodeStore((state) => state.setDeleteToggle);

	const setDeleteCodeId = useQrCodeStore((state) => state.setDeleteCodeId);
	const setDeleteName = useQrCodeStore((state) => state.setDeleteName);

	const deleteCodeId = useQrCodeStore((state) => state.deleteCodeId);
	const deleteName = useQrCodeStore((state) => state.deleteName);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		refetch();
	}, [refetchCodes]);

	// useEffect(() => {
	//     setMounted(true)
	//     return () => setMounted(false)
	// }, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isDeleteSuccess) {
			setDeleteCodeId(null);
			setDeleteName(null);
			refetch();
		}
	}, [refetch, isDeleteSuccess]);

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error</div>;
	if (!data) return <div>No data</div>;

	const QrCodes = data.codes.map((code) => {
		return (
			<Container
				key={code.id}
				bg={"rgba(255,255,255,0.1)"}
				p={20}
				size={"sm"}
				w={500}
				maw={"100dvw"}
				className="rounded-lg"
			>
				<Group justify="space-between" grow gap={0} mah={500} wrap="nowrap">
					<Stack gap={0}>
						<Title order={2}>{code.name}</Title>
						<Tooltip
							events={{ hover: true, focus: true, touch: !code.shareable }}
							bg={"transparent"}
							position="bottom"
							label={
								<Paper
									p={15}
									w={200}
									h={"auto"}
									withBorder
									className="rounded-xl bg-gradient-to-tr from-[#222840] to-[#2347a1]"
									c={"white"}
									styles={{
										root: {
											wordBreak: "break-all",
											textWrap: "wrap",
										},
									}}
								>
									{code.qrCode}
								</Paper>
							}
						>
							<Text truncate w={350} c={"dimmed"}>
								{" "}
								Value: {code.qrCode}
							</Text>
						</Tooltip>
						{/* <Text className='text-nowrap' c={"dimmed"}> Created / Updated At:  <DateElement /></Text> */}
					</Stack>
					<QrCodePreview data={code} w={100} />
				</Group>
				<Group justify="space-between" align="center">
					<PreviewButtons code={code} baseURL={baseURL} />
					<Text fz={11} c={"dimmed"}>
						{code.id}
					</Text>
				</Group>
			</Container>
		);
	});

	return (
		<>
			<Text pos={"static"} c={"dimmed"} fz={13}>
				{data.limits.current} / {data.limits.max} Save slots
			</Text>
			<Group wrap="wrap" grow justify="center">
				{QrCodes}
			</Group>
			<Modal
				centered
				overlayProps={{
					blur: 2,
				}}
				classNames={{
					body: "bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white",
				}}
				opened={opened && !!deleteCodeId}
				withCloseButton={false}
				onClose={() => {
					setDeleteCodeId(null);
					setDeleteName(null);
					setDeleteToggle();
					reset();
				}}
			>
				<Stack gap={5}>
					<Title order={2} ta="center" className="text-white">
						Delete QR Code
					</Title>
					<Text>Are you sure you want to delete this QR Code?</Text>
					<Pill className="bg-[rgba(255,255,255,0.1)]" variant="contrast" c={"red"} radius={5}>
						Name: {deleteName} <br />
						ID: {deleteCodeId}
					</Pill>

					<Text fz={13} c={"red"} mt={10}>
						This action cannot be undone.
					</Text>

					<Button
						loading={isDeleting}
						color="red"
						variant="light"
						leftSection={<FontAwesomeIcon icon={faTrashCan} />}
						onClick={() => {
							if (!deleteCodeId || !deleteName) return;
							deleteCode({ id: deleteCodeId });
						}}
					>
						Delete
					</Button>
				</Stack>
				<Box
					mt={10}
					w={"100%"}
					style={{ borderRadius: "5px" }}
					p={"sm"}
					c={"#fa2113"}
					bg={"#0D1117"}
					hidden={!isDeleteError}
				>
					{deleteError?.message}
				</Box>
			</Modal>
		</>
	);
};

export default QrCodePreviewContainer;
