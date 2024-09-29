import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";

export async function GET(req: NextRequest) {
	const session = await getServerAuthSession();
	if (!session?.user.id)
		return NextResponse.redirect(
			new URL(
				"/api/gh-stats/top-lang?layout=compact&hide=css&custom_title=M4X809's Top Languages&hide_border=true",
				req.url,
			),
		);
	if (session?.user.name !== "max809")
		return NextResponse.redirect(
			new URL(
				"/api/gh-stats/top-lang?layout=compact&hide=css&custom_title=M4X809's Top Languages&hide_border=true",
				req.url,
			),
		);

	console.log("session", session);
	revalidateTag("gh-stats");

	return NextResponse.redirect(new URL("/", req.url));

	// return new Response("Cleared cache", { status: 200 });
}

// export default async function ClearCache() {
//     const session = await getServerAuthSession();
//     console.log("session", session);

//     return redirect("/api/gh-stats/top-lang?username=m4x809",)
// }
