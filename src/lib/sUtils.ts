import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";

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
	console.log("permission", permission);
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
		})

		.safeParse(config);
}