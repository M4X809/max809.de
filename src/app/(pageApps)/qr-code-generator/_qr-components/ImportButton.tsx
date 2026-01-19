"use client";
import { faBan, faCheckSquare, faArrowUpRightFromSquare } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, Group, Box, Text } from "@mantine/core";
import { Dropzone, type FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { usePostHog } from "posthog-js/react";
// @ts-ignore
import QrcodeDecoder from "qrcode-decoder/dist/index.esm";
import { useState, useEffect } from "react";
import ErrorBox from "~/app/_components/ErrorBox";
import { useQrCodeStore } from "~/providers/qr-code-provider";
import { useAppStore } from "~/providers/app-store-provider";
import React from "react";

const ImportButton = () => {
	const posthog = usePostHog();

	const session = useAppStore((state) => state.session);
	const setQrCode = useQrCodeStore((state) => state.setQrCode);

	const myQrcodeDecoder = useQrCodeStore((state) => state.QrcodeDecoder);
	const setQrcodeDecoder = useQrCodeStore((state) => state.setQrcodeDecoder);

	const [openedDropzone, { toggle: toggleDropzone }] = useDisclosure(false);

	const [file, setFile] = useState<FileWithPath | null>(null);

	const fileAccepted = useQrCodeStore((state) => state.fileAccepted);
	const setFileAccepted = useQrCodeStore((state) => state.setFileAccepted);

	const fileRejected = useQrCodeStore((state) => state.fileRejected);
	const setFileRejected = useQrCodeStore((state) => state.setFileRejected);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (file && myQrcodeDecoder) {
			setFileAccepted(true);
			const imageUrl = URL.createObjectURL(file);
			myQrcodeDecoder
				.decodeFromImage(imageUrl)
				.then((result) => {
					if (result) {
						setQrCode(result.data);
						toggleDropzone();
						setFileAccepted(false);
						setFile(null);
						setFileRejected("");
					} else {
						setFileRejected("No QR Code found in this image.");
						setFileAccepted(false);
						setFile(null);
					}
				})
				.catch((_err) => {
					posthog.capture("import-qr-code-from-image", {
						distinctId: session?.user?.id,
						error: "Error decoding QR Code from image.",
					});
				});
		}
		return () => {
			setFile(null);
		};
	}, [file]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!myQrcodeDecoder) {
			const myQrcodeDecoder = new QrcodeDecoder();

			setQrcodeDecoder(myQrcodeDecoder);
		}
		return () => {
			setQrcodeDecoder(null);
		};
	}, []);

	return (
		<>
			<Button
				className="flex justify-center self-center text-nowrap rounded-full bg-white/10 px-8 font-semibold no-underline transition hover:bg-white/20"
				onClick={() => {
					toggleDropzone();
				}}
				fullWidth
				maw={500}
				variant="light"
			>
				Import QR Code from Image
			</Button>
			<Modal
				centered
				opened={openedDropzone}
				onClose={() => {
					toggleDropzone();
					setFileAccepted(false);
					setFileRejected("");
					setFile(null);
				}}
				withCloseButton={false}
				size="xl"
				radius="md"
				classNames={{
					body: "bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white",
				}}
			>
				<Dropzone
					loading={fileAccepted}
					bd={"0px"}
					className="bg-[rgba(255,255,255,0.1)] p-10 text-white hover:bg-[rgba(255,255,255,0.12)]"
					onDrop={(val) => {
						if (!val || !val[0]) return console.log("no file");
						setFileAccepted(true);
						setFile(val[0]);
					}}
					onReject={(files) => {
						const names = files.map((file) => (
							<Box key={file.file.name}>
								<Text size="md" c={"#ff0000"} inline>
									{file.file.name}:{" "}
									{file.errors.map((err, index) => (
										<Text component="span" c={"#ff0000"} inline key={err.code}>
											{err.code.split("-").join(" ")} {file.errors.length && index < file.errors.length - 1 ? " / " : ""}
										</Text>
									))}
								</Text>
							</Box>
						));
						if (names.length > 1) {
							return setFileRejected(
								<Text size="md" c={"#ff0000"} inline>
									To many files attached. Only one file is allowed.
								</Text>,
							);
						}
						setFileRejected(names);
					}}
					maxSize={5 * 1024 ** 2}
					maxFiles={1}
					accept={IMAGE_MIME_TYPE}
				>
					<Group>
						<Dropzone.Reject>
							<Group mih={50}>
								<FontAwesomeIcon fontSize={50} icon={faBan} />
								<div>
									<Text size="xl" inline>
										Only images are allowed. Max one file.
									</Text>
								</div>
							</Group>
						</Dropzone.Reject>
						<Dropzone.Accept>
							<Group mih={50}>
								<FontAwesomeIcon fontSize={50} icon={faCheckSquare} />
								<Text size="xl" inline c={"green"}>
									{" "}
									Let Go to Upload{" "}
								</Text>
							</Group>
						</Dropzone.Accept>
						<Dropzone.Idle>
							<Group mih={50}>
								<FontAwesomeIcon fontSize={50} icon={faArrowUpRightFromSquare} />
								<div>
									<Text size="xl" inline>
										Drag image here or click to select file.
									</Text>
									<Text size="sm" c="dimmed" inline mt={7}>
										Attach Max 1 File (Max 5 MB)
									</Text>
								</div>
							</Group>
						</Dropzone.Idle>
						<ErrorBox value={fileRejected} visible={!!fileRejected} />
					</Group>
				</Dropzone>
			</Modal>
		</>
	);
};

export default ImportButton;
