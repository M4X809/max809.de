// import { NextResponse, type NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
// 	const url = request.nextUrl.clone();
// 	const hostname = url.pathname.startsWith("/ingest/static/")
// 		? "eu-assets.i.posthog.com"
// 		: "eu.i.posthog.com";
// 	const requestHeaders = new Headers(request.headers);
// 	requestHeaders.set("host", hostname);
// 	url.protocol = "https";
// 	url.hostname = hostname;
// 	url.port = "443";
// 	url.pathname = url.pathname.replace(/^\/ingest/, "");

// 	return NextResponse.rewrite(url, {
// 		headers: requestHeaders,
// 	});
// }

// export const config = {
// 	matcher: "/ingest/:path*",
// };

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};