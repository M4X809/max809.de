import type { Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import Shell from "../_components/Shell";
import { Center, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/pro-duotone-svg-icons";

import { type ProjectImage, ProjectShowcase } from "~/components/project-showcase";
import { PostHog } from "posthog-node";
import { env } from "~/env";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import type { GhAPI } from "./_type";

import React from "react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        metadataBase: new URL('https://max809.de'),

        title: "Note Mark",
        description: "A simple desktop note taking app, utilizing the power of Markdown, Build with Electron.",
        icons: [{ rel: "icon", url: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1t7fMixwJ27LFyhSB3HwRQKtoxC0ZVWauJqrP" }],
        openGraph: {
            title: "Note Mark",
            description: "A simple desktop note taking app, utilizing the power of Markdown, Build with Electron.",
            images: [
                {
                    url: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1t7fMixwJ27LFyhSB3HwRQKtoxC0ZVWauJqrP",
                    width: 579,
                    height: 579,
                    alt: "note mark icon",
                },
            ],
            type: "website",
            siteName: "max809.de",
            url: "https://max809.de/note-mark",
            locale: "en_US",
        }
    }
}
export const revalidate = 60

export default async function NoteMark() {
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: env.NEXT_PUBLIC_POSTHOG_HOST,
    });
    const session = await getServerAuthSession();


    const pageEnabled = await client.isFeatureEnabled("note-mark-page", session?.user.id ?? "none")
    if (!pageEnabled) {
        redirect("/")
    }

    const projectImages: ProjectImage[] = [
        {
            id: 1,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1T8AKNp71aXGmChWOT4zM6DpIgyZxirAYdVjq",
            alt: "Note Mark",
            description: (
                <>
                    The UI (User Interface) of NoteMark is very simple and intuitive.
                    <br />
                    It has a sidebar on the left side, which contains all the notes of that specific folder, and a main area on the right side, where you can write your notes.
                    <br />
                    <br />
                    At the top of the Navbar, you can Search for notes in the current folder, or refresh  <Text inline component="span" c={"dimmed"}> <FontAwesomeIcon size="1x" fontSize={20} icon={faRefresh} /></Text>  the Files.
                    <br />
                    <br />
                    On the bottom of the Navbar, you can see the current folder, change the folder, or create a new folder / note.
                </>
            ),
        },
        {
            id: 6,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1KzRncClGZJSC6dpoqyr0B5Hbf4Wv79lDER3F",
            alt: "Navbar Context Menu",
            description: (
                <>
                    <Text component="span">
                        <Text component="span" fw={600} td={"underline"} >Pin / Unpin Note: </Text> This will pin the current note to the top of the sidebar for the current folder.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Delete Note: </Text> This will open a confirmation dialog before deleting the current note.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Rename Note: </Text> This will put the current note in edit mode, and allow you to rename the note. (Clicking on the note title twice will also enter this mode)

                    </Text>
                </>
            )
        },
        {
            id: 4,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1VlOaYFRjb6OvuSTwFeMfQ7NkjiYIWUoX2yrh",
            alt: "The Editor",
            description: (
                <>
                    <Text component="span">
                        <Text component="span" fw={700} >Editor Modes</Text>
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Edit Mode: </Text> The Raw Markdown Editor, No Preview. Just you and your notes.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Split Mode: </Text> The Split Mode allows you to split the editor into two panes. One for the Preview and one for the Editor.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Preview Mode: </Text> The Preview Mode allows you to view your notes Correctly formatted.
                    </Text>
                </>
            ),
        },
        {
            id: 2,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1ommBPUtGuaiZRnNK7Dk5CXsWmfxP4LFJSTwv",
            alt: "Update Center",
            description: (
                <>
                    <Text component="span">
                        At the top you can manually check for updates and see the current version of NoteMark.
                        <br />
                        <br />
                        <Text component="span" fw={700} >Options</Text>
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Auto check for updates: </Text>This will automatically check for updates every time you start the app and periodically every x min set below.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Update notifications: </Text> This will show a notification when a new update is available. (Not a system notification, but a notification in the app)
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Auto Download Update: </Text> This will automatically download the update when a new update is available. (Will notify you when the download is finished)
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Check interval: </Text> The Amount of time between each check for updates.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Show Changelog: </Text> This will show the changelog after the update is installed.
                    </Text>
                </>
            ),
        },


        {
            id: 5,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1UxW6EQD54dfX0qSYwRK1WFHZLJ2PogVhOENj",
            alt: "Toolbar",
            description: (
                <>
                    <Text component="span">
                        <Text component="span" fw={700} >Toolbar Sections</Text>
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >File: </Text> Save and Open in the file explorer.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Text Actions: </Text> Undo, Redo.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Text Formatting: </Text> Header, Bold, Italic, Strikethrough, Underline, Quote, List (Unordered, Ordered, Checklist), Code Snippet, Code Block.
                    </Text>
                </>
            ),
        },



        {
            id: 3,
            src: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1GLd4rvZyBEbtvYrjVexJ9n2R0ucm645hXdfS",
            alt: "Editor Settings",
            description: (
                <>
                    <Text component="span">
                        <Text component="span" fw={700} >Options</Text>
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Autosave: </Text> This will automatically save your notes every x min set below.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Auto Save after: </Text> The time after which the note will be automatically saved.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Backup on Startup: </Text> This will backup your notes on startup.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Preview Text Selection: </Text>Allows you to select text in the "Preview" area of the editor.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Allow Pinning: </Text> This will allow you to pin notes to the top of the sidebar.
                        <br />
                        <br />
                        <Text component="span" fw={600} td={"underline"} >Recreate:  </Text> This will recreate the Welcome Note, which is the first note you see when you open NoteMark.

                    </Text>
                </>
            ),
        },



    ]


    const latest = await fetch("https://api.github.com/repos/m4x809/note-mark/releases/latest", {
        cache: "force-cache"
    })

    let installerUrl: string | undefined = undefined
    let version: string | undefined = undefined

    if (latest.ok) {
        const data: GhAPI = await latest.json()
        const installer = data.assets.find((asset) => asset.name.includes(".exe") && !asset.name.includes("blockmap"))
        installerUrl = installer?.browser_download_url
        version = data.name
    }


    return (
        <HydrateClient>
            <Shell
                title="NoteMark"
                redirect={"/"}
            >
                <Center >
                    <ProjectShowcase projectImages={projectImages} downloadUrl={installerUrl} version={version} />
                </Center>
            </Shell>
        </HydrateClient>
    )
}

