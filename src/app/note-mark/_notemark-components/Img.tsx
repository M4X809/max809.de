"use client"
import Image, { type ImageProps } from "next/image"
import { PhotoView } from "react-photo-view"
import { twMerge } from "tailwind-merge"


export const Img = ({ ...props }: ImageProps & { ratio?: number }) => {
    return (
        <PhotoView src={props.src as string}>
            <Image src={props.src} alt="Note Mark" height={props.height || 500} width={props.width || 5000} quality={100} priority className={twMerge("rounded-lg", props.className)} />
        </PhotoView>
    )



}