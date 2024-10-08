"use server";

import { emojis } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export const deleteEmoji = async (emojiId: string) => {
	console.log("emojiId", emojiId);
	const session = await getServerAuthSession();
	if (session?.user?.name !== "max809") return;
	await db.delete(emojis).where(eq(emojis.id, emojiId)).execute();
	revalidatePath("/emoji-favicon");
};
