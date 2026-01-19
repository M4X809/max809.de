"use client";
import Image, { type ImageProps } from "next/image";

import { Image as MantineImage, type ImageProps as MantineImageProps } from "@mantine/core";
import { PhotoView } from "react-photo-view";
import { twMerge } from "tailwind-merge";

import type React from "react";

export const Img = ({
	imgType = "next",
	...props
}: ImageProps & MantineImageProps & { ratio?: number; imgType?: "next" | "mantine" }) => {
	if (imgType === "next") {
		return (
			<PhotoView src={props.src as string}>
				<Image
					onClick={(e) => e.preventDefault()}
					src={props.src}
					alt="Note Mark"
					height={props.height || 500}
					width={props.width || 5000}
					quality={100}
					priority
					className={twMerge("cursor-pointer rounded-lg", props.className)}
				/>
			</PhotoView>
		);
	}

	return (
		<PhotoView src={props.src as string} width={500} height={500}>
			<MantineImage
				onClick={(e: React.MouseEvent<HTMLImageElement, MouseEvent>) => e.preventDefault()}
				src={props.src}
				alt="Note Mark"
				h={props.height || "auto"}
				w={props.width || "auto"}
				className={twMerge("cursor-pointer rounded-lg", props.className)}
			/>
		</PhotoView>
	);
};
