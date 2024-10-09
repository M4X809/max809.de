"use server"
import { Center, Container, Stack, Title } from "@mantine/core";
import { revalidateTag, revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "~/app/_components/Shell";
import { env } from "~/env";
import { getDomain, onPageAllowed } from "~/lib/utils";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function ClearGhCache() {
	await onPageAllowed()
	const session = await getServerAuthSession();

	revalidateTag("gh-stats");
	console.log("revalidateTag");

	// return NextResponse.redirect(new URL("/", getDomain(env.NEXTAUTH_URL)));

	return (
		<HydrateClient>
			<Shell withLoginButton={false} session={session} title="Clear Cache" redirect={"/"}>
				<Container fluid className="h-[calc(100dvh-100px)]">
					<Center className=" h-full">
						<Stack gap={0}>
							<Title>
								Cache Cleared
							</Title>
							<Link prefetch href={"/"} className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap mt-5 flex justify-center" >
								Return to Homepage
							</Link>
						</Stack>
					</Center>
				</Container>
			</Shell>
		</HydrateClient>)
}

// export default async function ClearCache() {
//     const session = await getServerAuthSession();
//     console.log("session", session);

//     return redirect("/api/gh-stats/top-lang?username=m4x809",)
// }
