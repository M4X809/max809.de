import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDomain(url: string) {
	if (url.startsWith("http://")) return url;
	if (url.startsWith("https://")) return url;
	return `https://${url}`;
}
