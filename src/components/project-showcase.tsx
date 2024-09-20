"use client"

import type React from "react"
import { Img } from "~/app/note-mark/_notemark-components/Img"
import { Button } from "@mantine/core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from "@fortawesome/pro-duotone-svg-icons"

export interface ProjectImage {
  id: number
  src: string
  alt: string
  description: React.ReactNode
}
export function ProjectShowcase({ projectImages, downloadUrl, version }: { projectImages: ProjectImage[], downloadUrl?: string, version?: string }) {
  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-3xl font-bold mb-4"></h1> */}
      <p className="text-lg text-muted-foreground ">NoteMark is a simple desktop note taking app, utilizing the power of Markdown, Build with Electron.</p>
      <p className="text-md text-red-900 mb-6"> This app is still in development, and may not work as expected / may be unstable. Use at your own risk.</p>


      <div
        className="flex items-center justify-center gap-4"
      >
        <Button mb={20}
          component="a"
          href={downloadUrl ?? "https://github.com/m4x809/note-mark/releases/latest"}
          download={downloadUrl ? "" : ""}
          target={downloadUrl ? "" : "_blank"}
          leftSection={<FontAwesomeIcon icon={faDownload} />}
        >

          Download NoteMark (v{version})

        </Button>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {projectImages.map((image, index) => (
          <div key={`${image.id + index}`} className="break-inside-avoid  bg-[rgba(255,255,255,0.1)] rounded-lg shadow-md overflow-hidden">
            <Img src={image.src} alt={image.alt} className="w-full h-auto object-cover cursor-pointer transition-transform hover:scale-105" />
            <div className="p-4">
              <h2 className="text-lg text-white font-semibold mb-2">{image.alt}</h2>
              <p className="text-sm ">{image.description}</p>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}