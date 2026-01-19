import Link from "next/link";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import {
	AspectRatio,
	Box,
	Center,
	Container,
	Pill,
	type StyleProp,
	Title,
} from "@mantine/core";
import { twMerge } from "tailwind-merge";
import isOdd from "is-odd";
import { Img } from "~/app/note-mark/_notemark-components/Img";
import type React from "react";

type ShowcaseElementNormal = {
	type: "normal";
	title: string;
	description: string;
	imageLink?: string;
	imageAspectRatio?: number;
	imageElement?: React.ReactNode;
	link?: string;
	badges?: React.ReactNode | React.ReactNode[];
	prefetch?: boolean;
	classNames?: {
		imgClassName?: string;
		imgAspectRatioClassName?: string;
	};
	colSpan?: {
		card?: number;
		img?: number;
	};
	imgType?: "mantine" | "next";
	imgSizes?: {
		width?: StyleProp<React.CSSProperties["width"]>;
		height?: StyleProp<React.CSSProperties["height"]>;
	};
};

type ShowcaseElementImageOnly = {
	type: "image-only";
	title: string;
	children: (link?: string) => React.ReactNode | React.ReactNode[];
	link?: string;
	prefetch?: boolean;
};

export type ShowcaseElement =
	| ShowcaseElementNormal
	| ShowcaseElementImageOnly
	| (() => ShowcaseElementNormal)
	| (() => ShowcaseElementImageOnly);
export type ShowcaseElementNoFunction =
	| ShowcaseElementNormal
	| ShowcaseElementImageOnly;

export interface ShowcaseLayout {
	mainTitle: string;
	elements: ShowcaseElement[];
}

export default function ShowcaseGrid({ mainTitle, elements }: ShowcaseLayout) {
	const __elements =
		elements instanceof Function
			? (elements() as ShowcaseElementNoFunction[])
			: (elements as ShowcaseElementNoFunction[]);
	const lastElement = __elements.at(-1) as ShowcaseElementNoFunction;
	const odd = isOdd(elements.lastIndexOf(lastElement) + 1);

	return (
		<div className="flex justify-center">
			<Container className="py-8 xs:px-4" size={"lg"}>
				<h1 className="mb-8 select-none text-center text-3xl font-bold">
					{mainTitle}
				</h1>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{elements.map((_element) => {
						const element = _element instanceof Function ? _element() : _element;

						if (element.type === "image-only") {
							return (
								<Box
									key={element.title}
									className={twMerge(
										"block h-full select-none place-self-center",
										odd && lastElement.title === element.title
											? "sm:col-span-2 sm:w-[60rem] sm:place-self-center"
											: "",
									)}
								>
									{element.children(element.link)}
								</Box>
							);
						}
						const boxContent = (
							<Box
								key={element.title}
								className={twMerge(
									"block h-full max-w-full lg:max-w-[calc(100%)]",
									odd && lastElement.title === element.title
										? "lg:col-span-2 lg:w-[calc(80%)] lg:max-w-[calc(80%)] lg:place-self-center"
										: "",
								)}
							>
								<div className="grid h-full min-h-[100px] w-full max-w-full grid-cols-5 justify-between rounded-lg bg-[rgba(255,255,255,0.1)] transition-shadow hover:shadow-lg">
									<Card
										className={twMerge(
											"flex flex-col border-none bg-transparent text-white shadow-none sm:col-span-3",
											!!element.colSpan?.card && `sm:col-span-${element.colSpan?.card}`,
											"col-span-5",
										)}
									>
										<CardHeader className="select-none py-1 pt-2">
											<Title className="text-2xl">{element.title}</Title>
										</CardHeader>
										<CardContent className="flex flex-col gap-2 p-4">
											<p className="flex-grow text-sm">{element.description}</p>
										</CardContent>
										<CardFooter
											className={twMerge(
												"mt-auto flex min-h-[50px] select-none flex-wrap gap-2",
												!element.badges && "hidden",
											)}
										>
											{Array.isArray(element.badges)
												? element.badges.map((badge) => (
														<Pill key={badge?.toString()} variant="default">
															{badge}
														</Pill>
													))
												: element.badges && <Pill variant="default">{element.badges}</Pill>}
										</CardFooter>
									</Card>
									{element.imageLink && !element.imageElement && (
										<Center
											className={twMerge(
												"h-full max-h-[200px] w-auto select-none sm:col-span-2",
												element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`,
												element?.classNames?.imgClassName,
												"col-span-5",
											)}
										>
											<AspectRatio
												ratio={element.imageAspectRatio || 1}
												className={twMerge(
													"my-2 h-auto max-h-[180px] w-auto sm:col-span-2",
													element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`,
													element?.classNames?.imgAspectRatioClassName,
													"col-span-5",
												)}
											>
												<Img
													imgType={element.imgType}
													src={element.imageLink}
													alt={element.title}
													ratio={element.imageAspectRatio || 1}
													width={element.imgSizes?.width as number | `${number}` | undefined}
													height={
														element.imgSizes?.height as number | `${number}` | undefined
													}
													className={twMerge(
														"h-auto max-h-[inherit] w-full cursor-pointer rounded-md object-cover transition-transform hover:scale-105",
													)}
												/>
											</AspectRatio>
										</Center>
									)}
									{element.imageElement && (
										<div
											className={twMerge(
												"w-full sm:col-span-2",
												element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`,
												element?.classNames?.imgClassName,
												"col-span-5",
											)}
										>
											{element.imageElement}
										</div>
									)}
								</div>
							</Box>
						);
						return element.link ? (
							<Link
								href={element.link}
								prefetch={element.prefetch}
								key={element.title}
							>
								{boxContent}
							</Link>
						) : (
							boxContent
						);
					})}
				</div>
			</Container>
		</div>
	);
}
