import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	metadataBase: new URL("https://max809.com/r/spotify"),
	title: "Spotify Redirect",
	description: "Redirect to Spotify",
	robots: "noindex",
	icons: {
		icon: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green-300x300.png",
	},
	openGraph: {
		title: "Spotify Redirect",
		description: "Redirect to Spotify",
		url: "https://max809.com/r/spotify",
	},
};

export default async function SpotifyRedirect() {
	redirect("spotify://");
}
