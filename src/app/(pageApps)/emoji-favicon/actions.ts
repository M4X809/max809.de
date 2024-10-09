"use server";

import { emojis } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { isAdmin } from "~/lib/utils";

export const deleteEmoji = async (emojiId: string) => {
	console.log("emojiId", emojiId);
	const _isAdmin = await isAdmin();
	if (!_isAdmin) return;

	await db.delete(emojis).where(eq(emojis.id, emojiId)).execute();
	revalidatePath("/emoji-favicon");
};
