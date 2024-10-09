import { AspectRatio, Box, Center, Image as MantineImage } from "@mantine/core";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Shell from "./_components/Shell";

import QrCodePreview from "~/app/(pageApps)/qr-code-generator/_qr-components/QrCodePreview";
import type { Metadata } from 'next'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/pro-duotone-svg-icons";
// import { env } from "~/env";
import { getDomain, getUtUrl } from "~/lib/utils";
import ShowcaseGrid, { type ShowcaseLayout } from "~/components/showcase-grid"
import 'react-photo-view/dist/react-photo-view.css';
import { env } from "~/env";
import { Img } from "./note-mark/_notemark-components/Img";
import Link from "next/link";
import { db } from "~/server/db";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://max809.de'),

    title: "max809.de",
    description: "The Homepage of @max809",
    icons: [{ rel: "icon", url: "/max809.webp" }],
    openGraph: {
      title: "max809.de",
      description: "The Homepage of @max809",
      images: [
        {
          url: "/max809.webp",
          width: 1200,
          height: 630,
          alt: "max809.de",
        },
      ],
      type: "website",
      siteName: "max809.de",
      url: "https://max809.de/",
      locale: "en_US",
    }
  }
}

export const revalidate = 30
export const dynamic = "force-dynamic"


const otherApps: ShowcaseLayout = {
  mainTitle: "Other Apps",
  elements: [
    {
      type: "normal",
      title: "Note Mark",
      description: "This is a simple desktop note taking app, utilizing the power of Markdown, Build with Electron. It has a fully fledged auto updater, Settings to customize the app, and a lot more.",
      imageLink: getUtUrl("2014oiRrVeB1T8AKNp71aXGmChWOT4zM6DpIgyZxirAYdVjq"),
      badges: ["Under Development", "Windows Only", "No Account", "Local Only"],
      imageAspectRatio: 16 / 9,
      link: "/note-mark",
      prefetch: true,
      classNames: {
        imgClassName: " max-h-[280px]",
        imgAspectRatioClassName: " max-h-[250px]",
      },
      colSpan: {
        card: 2,
        img: 3,
      },
    }
  ]
};


const githubStats: ShowcaseLayout = {
  mainTitle: "Github Stats",
  elements: [
    {
      type: "image-only",
      title: "github-top-lang",
      link: "/note-mark ",
      children: (link) => {
        return (
          <Center >
            <Box
              component={link ? Link : undefined} href={link || "#"} prefetch={!!link}
            >
              <Img
                imgType="mantine"
                src={`${getDomain(env.NEXTAUTH_URL)}/api/gh-stats/top-lang?layout=compact&hide=css&custom_title=M4X809's Top Languages&hide_border=true`}
                alt="gh-stats"
                ratio={16 / 9}
                width={500}
              />
            </Box>
          </Center>
        )
      }
    }
  ]
}

export default async function Home() {
  const session = await getServerAuthSession();

  const topEmoji = await db.query.emojis.findFirst({
    orderBy: (emojis, { desc }) => desc(emojis.callCount),
    columns: { emoji: true }
  })
  console.log("topEmoji", topEmoji);


  const appsOnPage: ShowcaseLayout = {
    mainTitle: "Apps on this site",
    elements: [
      {
        type: "normal",
        title: "Qr Code Generator",
        description: "This is a QR Code Generator. It allows you to create QR Codes with customizable options. You can save them to your account and share them with others.",
        // imageLink: "/qr-code-generator.png",
        imageElement: (
          <Center className="h-full w-full">
            <QrCodePreview
              data={{
                color: "rgba(255,255,255,1)",
                backgroundColor: "rgba(0,0,0,0)",
                finderRadius: 0,
                dotRadius: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                qrCode: "https://max809.de/qr-code-generator",
                qrLvl: 0,
                size: 2048,
                id: "1",
                name: "QR Code Generator",
                createdById: "1",
              }}
              w={200} />

          </Center>
        ),
        badges: ["Some features require login!"],
        imageAspectRatio: 1 / 1,
        link: "/qr-code-generator",
        prefetch: true

      },
      {
        type: "normal",
        title: "Emoji Favicon API",
        description: "This is a simple API to generate emoji favicons.",
        badges: ["For Fun", "API", "Public"],
        imageAspectRatio: 1 / 1,
        link: "/emoji-favicon",
        prefetch: true,
        imgType: "mantine",
        imageLink: `${getDomain(env.NEXTAUTH_URL)}/api/icon/${topEmoji?.emoji ?? "👑"}`,
        imgSizes: {
          height: "140px",
          width: "140px",
        }
      },
      {
        type: "normal",
        title: "Cube Timer",
        description: "A SpeedCubing timer. Generate scrambles, Calculate Averages and more.",
        imageElement: (
          <Center className="h-full w-full ">
            <AspectRatio ratio={1 / 1} maw={100} >
              <FontAwesomeIcon icon={faCube} size="10x" height={200} width={100} />
            </AspectRatio>
          </Center>),
        badges: ["Under Development", " Some feature requires login!"],
        imageAspectRatio: 1 / 1,
        link: "/cube-timer",
        prefetch: true
      },

    ]
  }


  return (
    <HydrateClient>
      <Shell session={session}
        title="max809.de"
        withLoginButton
      >
        <ShowcaseGrid
          mainTitle={appsOnPage.mainTitle}
          elements={appsOnPage.elements}

        />
        <ShowcaseGrid
          mainTitle={otherApps.mainTitle}
          elements={otherApps.elements}
        />
        <ShowcaseGrid
          mainTitle={githubStats.mainTitle}
          elements={githubStats.elements}
        />
        <Box
          className=""
        >

        </Box>

      </Shell >
    </HydrateClient >
  )
}

