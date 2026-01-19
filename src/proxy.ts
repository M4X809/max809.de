import { type MiddlewareConfig, NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";

import chalk from "chalk";

export function proxy(request: NextRequest) {
	// const headersList = headers();
	// const requestHeaders = new Headers(headersList);
	const requestHeaders = new Headers(request.headers);

	// console.log(request.nextUrl.pathname);

	// if (request.nextUrl.pathname.startsWith("/api/gh-stats")) {
	// 	// if (requestHeaders.get("Cache-Control") === "no-cache") {
	// 	// 	return new NextResponse("nope", { status: 400 });
	// 	// }
	// 	// console.log("requestHeaders", );
	// 	console.log(
	// 		chalk.red("cacheControl middleware", requestHeaders.get("Cache-Control")),
	// 	);
	// 	requestHeaders.set("Cache-Control", "force-cache");
	// 	requestHeaders.set("Pragma", "force-cache");
	// 	return NextResponse.rewrite(request.nextUrl.clone(), {
	// 		headers: {
	// 			...requestHeaders,
	// 			"Cache-Control": "force-cache",
	// 			Pragma: "force-cache",
	// 		},
	// 		request: {
	// 			headers: requestHeaders,
	// 		},
	// 	});
	// }

	if (request.nextUrl.pathname.startsWith("/ingest")) {
		const url = request.nextUrl.clone();
		const hostname = url.pathname.startsWith("/ingest/static/") ? "eu-assets.i.posthog.com" : "eu.i.posthog.com";
		requestHeaders.set("host", hostname);

		url.protocol = "https";
		url.hostname = hostname;
		url.port = "443";
		url.pathname = url.pathname.replace(/^\/ingest/, "");

		return NextResponse.rewrite(url, {
			headers: requestHeaders,
		});
	}

	requestHeaders.set("x-pathname", request.nextUrl.pathname);
	// console.log("request.nextUrl.pathname", request.nextUrl.pathname);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: ["/ingest/:path*", "/:path*"],
};

// export const ghMiddleware = GHMiddleware;
