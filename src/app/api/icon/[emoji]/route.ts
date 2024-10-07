import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { emojis } from "~/server/db/schema";
import { getServerAuthSession } from "~/server/auth";
import { getDomain } from "~/lib/utils";
import { env } from "~/env";
import chalk from "chalk";
import sharp from "sharp";

import os from "node:os";
import { createCanvas, registerFont } from "canvas";

export const revalidate = 60;
export const dynamic = "force-dynamic";

import puppeteer from "puppeteer";

const convertPng = async (
	svg: string,
	userAgent?: string | null,
): Promise<Uint8Array> => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Render the emoji on the page
	await page.setContent(`
    <html>
      <body style="background: transparent !important; display: flex; justify-content: center; align-items: center; ">
        ${svg}
      </body>
    </html>
  `);

	await page.setViewport({ width: 500, height: 450 });
	if (userAgent) await page.setUserAgent(userAgent);

	const jpeg = await page.screenshot({
		omitBackground: true,
		type: "png",
		optimizeForSpeed: true,
	});

	// page.close();
	void browser.close();

	return jpeg;
};

export async function GET(
	req: NextRequest,
	{ params }: { params: { emoji?: string } },
) {
	try {
		let serverRequest = false;
		console.info(chalk.yellow("IP", req.ip, req.headers.get("x-forwarded-for")));

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

		const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
			<text fill="#ffffff" font-size="75" font-family="Verdana" x="0" y="70">${emoji}</text>
		</svg>
		`;

		const forceSvg =
			req.nextUrl.search.includes("svg") ||
			(true && !req.nextUrl.search.includes("png")); // ?svg tacked on the end forces SVG, handy for css cursors
		const forcePng =
			req.nextUrl.search.includes("png") && !req.nextUrl.search.includes("svg"); // ?png tacked on the end forces PNG, handy for css cursors
		const userAgent = req.headers.get("user-agent");

		if (userAgent?.includes("Safari") && !userAgent.includes("Chrome")) {
			const png = await convertPng(svg, userAgent);
			// console.log("Safari");
			return new NextResponse(png, {
				status: 200,
				headers: { "Content-Type": "image/png", Cache: "max-age=60" },
			});
		}

		if (forcePng && forceSvg) {
			// console.log("Both png and svg are forced.");
			return NextResponse.json(
				{ error: "Both png and svg are forced." },
				{ status: 400 },
			);
		}

		if (forcePng) {
			const png = await convertPng(svg, userAgent);

			// console.log("Forcing PNG");
			return new NextResponse(png, {
				status: 200,
				headers: { "Content-Type": "image/png", Cache: "max-age=60" },
			});
		}
		if (forceSvg || !forcePng) {
			// console.log("Forcing SVG");
			return new NextResponse(svg, {
				status: 200,
				headers: { "Content-Type": "image/svg+xml", Cache: "max-age=60" },
			});
		}
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

// Handle POST request to convert SVG to PNG
// export async function POST(
// 	request: NextRequest,
// 	context: { params: { emoji?: string } },
// ) {
// 	try {
// 		// Extract SVG data from the request body
// 		const body = `
// 			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
// 				<text fill="#ffffff" font-size="75" font-family="Verdana" x="0" y="70">${context.params.emoji}</text>
// 			</svg>
// 		`;

// 		if (!body) {
// 			return NextResponse.json(
// 				{ message: "SVG data is required" },
// 				{ status: 400 },
// 			);
// 		}

// 		// Convert the SVG to PNG using sharp
// 		const pngBuffer = await sharp(Buffer.from(body)).png().toBuffer();

// 		// Return the PNG image as a response
// 		return new NextResponse(pngBuffer, {
// 			headers: {
// 				"Content-Type": "image/png",
// 				"Content-Disposition": 'inline; filename="output.png"',
// 			},
// 		});
// 	} catch (error) {
// 		console.error("Error during SVG to PNG conversion:", error);
// 		return NextResponse.json(
// 			{ message: "Error converting SVG to PNG" },
// 			{ status: 500 },
// 		);
// 	}
// }

// import puppeteer from "puppeteer";

// export async function GET(
// 	req: NextRequest,
// 	context: { params: { emoji?: string } },
// ) {
// 	const browser = await puppeteer.launch();
// 	const page = await browser.newPage();

// 	// Render the emoji on the page
// 	const emoji = context.params.emoji;
// 	await page.setContent(`
//     <html>
//       <body style="font-size: 100px; font-family: 'Noto Color Emoji', sans-serif;">
//         ${emoji}
//       </body>
//     </html>
//   `);

// 	// Take a screenshot
// 	const pngBuffer = await page.screenshot({ type: "png" });

// 	await browser.close();

// 	// Send the PNG as a response
// 	return new NextResponse(pngBuffer, {
// 		headers: {
// 			"Content-Type": "image/png",
// 			"Content-Disposition": `inline; filename="output.png"`,
// 		},
// 		status: 200,
// 	});
// }
