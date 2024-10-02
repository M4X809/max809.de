import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { AspectRatio, Box, Center, Container, Image, Pill, Title } from "@mantine/core"
import { twMerge, type ClassNameValue } from "tailwind-merge"
import isOdd from "is-odd"
import { Img } from "~/app/note-mark/_notemark-components/Img"
import type React from "react"
import type { HTMLProps } from "react"
import { clsx, type ClassValue } from "clsx";





type ShowcaseElementNormal = {
  type: "normal"
  title: string
  description: string
  imageLink?: string
  imageAspectRatio?: number
  imageElement?: React.ReactNode
  link?: string
  badges?: React.ReactNode | React.ReactNode[]
  prefetch?: boolean
  classNames?: {
    imgClassName?: string
    imgAspectRatioClassName?: string
  }
  colSpan?: {
    card?: number
    img?: number
  }

}

type ShowcaseElementImageOnly = {
  type: "image-only"
  title: string
  children: (link?: string) => React.ReactNode | React.ReactNode[]
  link?: string
  prefetch?: boolean
}


export type ShowcaseElement = ShowcaseElementNormal | ShowcaseElementImageOnly | (() => ShowcaseElementNormal) | (() => ShowcaseElementImageOnly)
type ShowcaseElementNoFunction = ShowcaseElementNormal | ShowcaseElementImageOnly


export interface ShowcaseLayout {
  mainTitle: string
  elements: ShowcaseElement[]
}

const defaultShowcaseData: ShowcaseLayout = {
  mainTitle: "Our Products",
  elements: [
    {
      type: "normal",
      title: "Product 1",
      description: "This is a description of Product 1. It's a fantastic product with many great features.",
      imageLink: "/placeholder.svg?height=200&width=300",
      badges: ["New", "Featured"],
      link: "/product1",
      prefetch: true
    },
    {
      type: "normal",
      title: "Product 2",
      description: "Product 2 is our bestseller. It's loved by customers worldwide for its quality and durability.",
      imageLink: "/placeholder.svg?height=200&width=300",
      badges: ["Bestseller"],
      link: "/product2"
    },
    {
      type: "normal",
      title: "Product 3",
      description: "Introducing Product 3, our latest innovation. It's designed to make your life easier and more efficient.",
      imageLink: "/placeholder.svg?height=200&width=300",
      badges: ["New", "Limited Edition"],
      link: "/product3"
    }
  ]
}

export default function ShowcaseGrid({ mainTitle = defaultShowcaseData.mainTitle, elements = defaultShowcaseData.elements }: ShowcaseLayout) {

  const __elements = elements instanceof Function ? elements() as ShowcaseElementNoFunction[] : elements as ShowcaseElementNoFunction[]

  // const lastElement = elements instanceof Function ? elements().at(-1) as ShowcaseElement : elements.at(-1) as ShowcaseElement



  const lastElement = __elements.at(-1) as ShowcaseElementNoFunction
  const odd = isOdd(elements.lastIndexOf(lastElement) + 1)

  // console.log("lastElement", lastElement.title)
  // console.log("odd", odd)

  return (
    <div className="flex justify-center">
      <Container className=" xs:px-4 py-8 ">
        <h1 className="text-3xl font-bold mb-8 text-center select-none">{mainTitle}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          {elements.map((_element) => {
            const element = _element instanceof Function ? _element() : _element

            if (element.type === "image-only") {
              return (
                <Box
                  key={element.title}
                  className={twMerge("block h-full place-self-center select-none ", odd && lastElement.title === element.title ? "sm:col-span-2 sm:place-self-center sm:w-[60rem]" : "")}
                >
                  {element.children(element.link)}

                </Box>
              )
            }


            return (
              <Box
                component={element.link ? Link : undefined}
                href={element.link || '#'}
                key={element.title}
                prefetch={element.prefetch}
                className={twMerge("block h-full max-w-full lg:max-w-[calc(100%)]", odd && lastElement.title === element.title ? "lg:col-span-2 lg:place-self-center  lg:w-[60rem]" : "")}
              >
                <div className="grid grid-cols-5 justify-between h-full min-h-[100px]  transition-shadow hover:shadow-lg bg-[rgba(255,255,255,0.1)] rounded-lg">
                  <Card className={twMerge("flex flex-col bg-transparent border-none sm:col-span-3 text-white shadow-none ", !!element.colSpan?.card && `sm:col-span-${element.colSpan?.card}`, "col-span-5")}>
                    <CardHeader className="py-1 pt-2 select-none">
                      <Title className="text-2xl">{element.title}</Title>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 p-4">
                      {/* <div className="flex flex-col md:flex-row gap-4 items-start md:items-center"> */}
                      <p className="text-sm flex-grow">{element.description}</p>
                      {/* </div> */}
                    </CardContent>
                    <CardFooter className={twMerge("flex flex-wrap gap-2 mt-auto min-h-[50px] select-none", !element.badges && "hidden")}>
                      {Array.isArray(element.badges) ? (
                        element.badges.map((badge) => (
                          <Pill key={badge?.toString()} variant="default">
                            {badge}
                          </Pill>
                        ))
                      ) : (
                        element.badges && <Pill variant="default">{element.badges}</Pill>
                      )}
                    </CardFooter>
                  </Card>
                  {element.imageLink && !element.imageElement && (
                    <Center className={twMerge("w-auto h-full max-h-[200px] sm:col-span-2 select-none", element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`, element?.classNames?.imgClassName, "col-span-5")}>
                      <AspectRatio
                        ratio={element.imageAspectRatio || 1}
                        className={twMerge("w-auto h-auto max-h-[180px] sm:col-span-2  my-2 ", element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`, element?.classNames?.imgAspectRatioClassName, "col-span-5")}
                      >
                        <Img
                          src={element.imageLink}
                          alt={element.title}
                          ratio={element.imageAspectRatio || 1}
                          className="w-full h-auto object-cover cursor-pointer transition-transform hover:scale-105 rounded-md max-h-[inherit] "
                        />
                      </AspectRatio>
                    </Center>
                  )}
                  {element.imageElement && (
                    <div className={twMerge("w-full sm:col-span-2 ", element.colSpan?.img && `sm:col-span-${element.colSpan?.img}`, element?.classNames?.imgClassName, "col-span-5")}>
                      {element.imageElement}
                    </div>
                  )}
                </div>
              </Box>
            )
          })}
        </div>
      </Container>
    </div>
  )
}