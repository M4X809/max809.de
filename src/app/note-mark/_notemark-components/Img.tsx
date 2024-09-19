"use client"
import Image, { type ImageProps } from "next/image"
import { AspectRatio, type StyleProp } from "@mantine/core"
import { PhotoView } from "react-photo-view"
import { twMerge } from "tailwind-merge"






export const Img = ({ ...props }: ImageProps & { ratio?: number }) => {
    return (
        // <AspectRatio
        //     className="cursor-pointer"
        //     h={"auto"}
        //     ratio={props.ratio || 1 / 1}
        //     w={props.aw}
        // >
        <PhotoView

            src={props.src as string}
        // width={1920} height={1080}
        >
            <Image src={props.src} alt="Note Mark" height={props.height || 500} width={props.width || 5000} quality={100} priority className={twMerge("rounded-lg", props.className)} />
        </PhotoView>
        // {/* </AspectRatio> */}
    )



}