"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function refreshAction(path: string) {
	console.log("refreshing");
	const { success, data } = z
		.string()
		.min(1)
		.max(100)
		.startsWith("/")
		.safeParse(path);
	if (!success) {
		throw new Error("Invalid path provided.");
	}
	revalidatePath(`${data}`);
	return;
}
