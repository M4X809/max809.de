"use client";

import { ActionIcon, CopyButton, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useState } from "react";

import EmojiPicker, { EmojiStyle, SuggestionMode, Theme } from "emoji-picker-react";
import { useMounted } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/pro-duotone-svg-icons";
import { twMerge } from "tailwind-merge";
import { InlineCodeHighlight } from "@mantine/code-highlight";

const ExampleInput = ({ url }: { startEmoji?: string; url: string }) => {
	const [value, setValue] = useState("👑");
	const mounted = useMounted();

	const exampleHtml1 = `
        <link rel="icon" href="${url}/api/icon/${value}" />
    `;
	const exampleHtml2 = `
        <img src="${url}/api/icon/${value}" alt="emoji favicon" height="200" width="200" /> 
    `;

	return (
		<Stack justify="center" mt={20} className="flex">
			<Title ta={"center"} order={2}>
				Usage
			</Title>

			<Group className="min-h-[400px] md:flex-nowrap">
				<Stack className="grow md:w-1/2 md:grow-0">
					<Group className="flex-nowrap place-content-center justify-between rounded-lg bg-[rgba(255,255,255,0.1)] p-2 text-white hover:bg-[rgba(255,255,255,0.12)]">
						<Text truncate>{`${url}/api/icon/${value}`}</Text>
						<CopyButton value={`${url}/api/icon/${value}`}>
							{({ copied, copy }) => (
								<ActionIcon
									onClick={copy}
									className={twMerge(
										"transition-colors duration-500",
										copied ? "bg-green-800 text-green-200 hover:bg-green-800 hover:text-green-200" : "",
									)}
								>
									<FontAwesomeIcon icon={faCopy} />
								</ActionIcon>
							)}
						</CopyButton>
					</Group>
					<Group>
						<Text>
							Embed the link above in your website. For example as an favicon image. You can click the codeblocks below to copy
							the HTML code.
						</Text>
					</Group>
					{/* <Group className="max-w-full"> */}
					<CopyButton value={exampleHtml1}>
						{({ copied, copy }) => (
							<UnstyledButton onClick={copy} className={twMerge("cursor-pointer", copied && "outline-8 outline-green-500")}>
								<InlineCodeHighlight
									code={exampleHtml1}
									language="html"
									className={twMerge(
										"outline-10 cursor-pointer rounded-lg outline outline-transparent transition-colors duration-500",
										copied && "outline-green-200",
									)}
									w={"auto"}
								/>
							</UnstyledButton>
						)}
					</CopyButton>
					<CopyButton value={exampleHtml2}>
						{({ copied, copy }) => (
							<UnstyledButton onClick={copy} className={twMerge("cursor-pointer", copied && "outline-8 outline-green-500")}>
								<InlineCodeHighlight
									code={exampleHtml2}
									language="html"
									className={twMerge(
										"outline-10 cursor-pointer rounded-lg outline outline-transparent transition-colors duration-500",
										copied && "outline-green-200",
									)}
									w={"auto"}
								/>
							</UnstyledButton>
						)}
					</CopyButton>

					{/* </Group> */}
					{/* <CodeHighlight code={exampleHtml2} language="html" className="rounded-lg  w-full" /> */}
				</Stack>

				{mounted && (
					<EmojiPicker
						className="grow"
						theme={Theme.DARK}
						height={400}
						suggestedEmojisMode={SuggestionMode.FREQUENT}
						autoFocusSearch={false}
						previewConfig={{
							showPreview: false,
						}}
						emojiStyle={EmojiStyle.NATIVE}
						lazyLoadEmojis={true}
						onEmojiClick={(emoji) => {
							// console.log("emoji", emoji.emoji)
							setValue(`${emoji.emoji}`);
						}}
					/>
				)}
			</Group>
		</Stack>
	);
};

export default ExampleInput;
