"use server";

import { revalidatePath } from "next/cache";

export async function refreshAction(id: string) {
	console.log("refreshing");
	revalidatePath(`/dashboard/user/${id}`);
	return;
}
