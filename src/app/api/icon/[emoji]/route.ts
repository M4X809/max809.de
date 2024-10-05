import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { emojis } from "~/server/db/schema";
import { getServerAuthSession } from "~/server/auth";
import { getDomain } from "~/lib/utils";
import { env } from "~/env";

import chalk from "chalk";

export const revalidate = 60;
export const dynamic = "force-dynamic";

// await fetch("http://localhost:3000/api/icon/😀?serverRequest=true");

export async function GET(
	req: NextRequest,
	{ params }: { params: { emoji?: string } },
) {
	try {
		let serverRequest = false;

		const _referer = req.headers.get("referer");
		if (_referer?.includes(getDomain(env.NEXTAUTH_URL))) serverRequest = true;

		console.info(
			serverRequest
				? chalk.green("serverRequest", serverRequest)
				: chalk.red("serverRequest", serverRequest),

			chalk.yellow("\nreferer", _referer),
		);

		const _emoji = params.emoji;
		if (!_emoji) return new NextResponse("Missing emoji", { status: 400 });

		const { data: emoji, error } = z.string().emoji().safeParse(_emoji);
		if (error) {
			return NextResponse.json({ error: error.issues[0]?.message });
		}

		const emojiHash = emoji.codePointAt(0)?.toString(16);
		if (!emojiHash) return new NextResponse("Invalid emoji", { status: 400 });
		console.log("emojiHash", emojiHash);

		const emojiIcon = await db.query.emojis.findFirst({
			where: eq(emojis.id, emojiHash),
		});

		if (emojiIcon && !serverRequest) {
			await db
				.update(emojis)
				.set({
					lastCalledAt: new Date(),
				})
				.where(eq(emojis.id, emojiHash))
				.execute();
		} else if (!emojiIcon && !serverRequest) {
			await db
				.insert(emojis)
				.values({
					id: emojiHash,
					emoji,
					callCount: 1,
					lastCalledAt: new Date(),
				})
				.execute();
		}
		// const svg = `
		// 	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" xmlns:xlink="http://www.w3.org/1999/xlink">
		// 		<text fill="#ffffff" font-size="75" font-family="Verdana" x="0" y="70" >${emoji}</text>
		// 	</svg>
		// `;
		const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
			<text fill="#ffffff" font-size="75" font-family="Verdana" x="0" y="70">${emoji}</text>
		</svg>
		`;

		return new NextResponse(svg, {
			status: 200,
			headers: { "Content-Type": "image/svg+xml", Cache: "max-age=60" },
		});
	} catch (error) {
		if (error instanceof Error) {
			const session = await getServerAuthSession();
			if (session?.user?.name === "max809") {
				console.error(error.message);
				return NextResponse.json(
					{
						errorMessage: error.message,
						stack: error.stack?.split("at").join("\n"),
						name: error.name,
						cause: error.cause,
					},
					{ headers: { "Content-Type": "application/json" }, status: 500 },
				);
			}

			console.error(error.message);
			return NextResponse.json(
				{ error: "Internal Server Error" },
				{ headers: { "Content-Type": "application/json" }, status: 500 },
			);
		}
	}
}
