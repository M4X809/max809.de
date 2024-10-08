import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDomain(url: string = env.NEXTAUTH_URL) {
	if (url.startsWith("http://")) return url;
	if (url.startsWith("https://")) return url;
	return `https://${url}`;
}

export function getUtUrl(key: string): string {
	return `https://utfs.io/a/su1pkz07fn/${key}`;
}
