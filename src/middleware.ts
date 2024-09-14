import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();
	const hostname = url.pathname.startsWith("/ingest/static/")
		? "eu-assets.i.posthog.com"
		: "eu.i.posthog.com";
	const requestHeaders = new Headers(request.headers);

	requestHeaders.set("host", hostname);

	url.protocol = "https";
	url.hostname = hostname;
	url.port = "443";
	url.pathname = url.pathname.replace(/^\/ingest/, "");

	// console.log(url.toString());

	return NextResponse.rewrite(url, {
		headers: requestHeaders,
	});
}

export const config = {
	matcher: "/ingest/:path*",
};
