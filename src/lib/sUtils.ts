import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import type { Key } from "ts-key-enum";
import type { User } from "next-auth";
import { db } from "~/server/db";
import chalk from "chalk";
import { eq } from "drizzle-orm";
import { loginWhitelist, users } from "~/server/db/schema";

export function getDomain(url: string = env.NEXTAUTH_URL) {
	if (url.startsWith("http://")) return url;
	if (url.startsWith("https://")) return url;
	return `https://${url}`;
}

export function getUtUrl(key: string): string {
	return `https://utfs.io/a/su1pkz07fn/${key}`;
}

export async function isStaff(): Promise<boolean> {
	const session = await getServerAuthSession();
	if (!session?.user.id) return false;
	if (session.user.admin || session.user.staff) return true;
	return false;
}

export async function isAdmin(): Promise<boolean> {
	const session = await getServerAuthSession();
	if (!session?.user.id) return false;
	if (session.user.admin) return true;
	return false;
}

export async function hasPermission(
	permission: string | string[],
): Promise<boolean> {
	const session = await getServerAuthSession();
	if (!session?.user.id) return false;
	if (session.user.admin) return true;
	if (Array.isArray(permission)) {
		if (permission.some((perm) => session.user.permissions?.includes(perm)))
			return true;
		return false;
	}

	if (session.user.permissions?.includes(permission)) return true;
	return false;
}
// MARK: On Page Allowed
export async function onPageAllowed(
	/**
	 * Permission can be a string or an array of strings
	 *
	 * Special permissions are "staff" and "admin", they do not check the user permissions, but the access level.
	 *
	 * If permission is not provided, it will check if the user is an admin.
	 */
	permission?: string | string[] | "staff" | "admin",
): Promise<void> {
	if (!permission || permission === "admin") {
		const admin = await isAdmin();
		if (admin) return;
		return redirect(`/noPerm?t=${new Date().getTime()}`, RedirectType.replace);
	}
	if (permission === "staff") {
		const staff = await isStaff();
		if (staff) return;
		return redirect(`/noPerm?t=${new Date().getTime()}`, RedirectType.replace);
	}

	const hasPerm = await hasPermission(permission);
	if (hasPerm) return;
	return redirect(`/noPerm?t=${new Date().getTime()}`, RedirectType.replace);
}
// MARK: Set Nested Value
export function setNestedValue<T extends object>(
	obj: T,
	path: string,
	value: any,
): T {
	const keys = path.split(".");
	const lastKey = keys.pop()!;
	const current: any = { ...obj };
	let currentObj = current;

	for (const key of keys) {
		currentObj[key] = { ...currentObj[key] };
		currentObj = currentObj[key];
	}

	currentObj[lastKey] = value;

	return current;
}

// MARK: Check Config
export function checkConf(config: object | undefined | null) {
	return z
		.object({
			userPage: z
				.object({
					expanded: z.array(z.string()).default([]),
				})
				.default({
					expanded: [],
				}),
			global: z
				.object({
					openCommandKey: z.string().default("F1") as
						| z.ZodType<keyof typeof Key>
						| z.ZodType<keyof (typeof Key)[]>,
				})
				.default({
					openCommandKey: "F1",
				}),
		})

		.safeParse(config);
}

export const checkWhitelist = async ({
	user,
}: {
	user: Pick<User, "id">;
}): Promise<void> => {
	const dbUser = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, user.id),
	});
	if (!dbUser) {
		console.error(chalk.red.bold("dbUser not found"));
		return;
	}
	if (dbUser?.whiteListId) {
		return;
	}

	const whitelist = await db.query.loginWhitelist.findFirst({
		where: (loginWhitelist, { eq }) => eq(loginWhitelist.email, dbUser.email),
	});

	if (whitelist) {
		console.log(chalk.yellow("whitelist", JSON.stringify(whitelist, null, 2)));

		await db
			.update(users)
			.set({
				whiteListId: whitelist.whiteListId,
			})
			.where(eq(users.id, dbUser.id))
			.execute();

		await db
			.update(loginWhitelist)
			.set({
				userId: dbUser.id,
			})
			.where(eq(loginWhitelist.email, dbUser.email))
			.execute();
	}
};
