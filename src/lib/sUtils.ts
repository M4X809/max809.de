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
import { headers } from "next/headers";

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
	permission: string[],
	haveAllPermissions: true,
	ignoreAdmin?: boolean,
): Promise<boolean>;

export async function hasPermission(
	permission: string | string[],
	haveAllPermissions?: false,
	ignoreAdmin?: boolean,
): Promise<boolean>;

export async function hasPermission(
	/**
	 * Permission can be a string or an array of strings
	 */
	permission: string | string[],
	/**
	 * If the user has all permissions in the array
	 */
	haveAllPermissions = false,

	/**
	 * If set to True, the admin will also require the permission
	 */
	ignoreAdmin = false,
): Promise<boolean> {
	const session = await getServerAuthSession();
	if (!session?.user.id) return false;
	if (session.user.admin && !ignoreAdmin) return true;
	if (Array.isArray(permission)) {
		if (haveAllPermissions) {
			if (permission.every((perm) => session.user.permissions?.includes(perm)))
				return true;
			return false;
		}
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

	/**
	 * If the user has all permissions in the array
	 */
	haveAllPermissions = false,

	/**
	 * If set to True, the admin will also require the permission
	 */
	ignoreAdmin = false,
): Promise<void> {
	const headersList = await headers();

	if (!permission || permission === "admin") {
		const admin = await isAdmin();
		if (admin) return;
		return redirect(
			`/noPerm?t=${new Date().getTime()}&callbackUrl=${headersList.get("x-pathname")}`,
			RedirectType.replace,
		);
	}
	if (permission === "staff") {
		const staff = await isStaff();
		if (staff) return;
		return redirect(
			`/noPerm?t=${new Date().getTime()}&callbackUrl=${headersList.get("x-pathname")}`,
			RedirectType.replace,
		);
	}

	if (Array.isArray(permission) && haveAllPermissions) {
		const hasPerm = await hasPermission(permission, true, ignoreAdmin);
		if (hasPerm) return;
		return redirect(
			`/noPerm?t=${new Date().getTime()}&callbackUrl=${headersList.get("x-pathname")}`,
			RedirectType.replace,
		);
	}

	const hasPerm = await hasPermission(permission, false, ignoreAdmin);
	if (hasPerm) return;
	return redirect(
		`/noPerm?t=${new Date().getTime()}&callbackUrl=${headersList.get("x-pathname")}`,
		RedirectType.replace,
	);
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
					openCommandKey: z.string().default("F1"),
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
		// console.log(chalk.yellow("whitelist", JSON.stringify(whitelist, null, 2)));

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

export function emailHtml(params: { url: string; host: string }) {
	const { url, host } = params;
	const escapedHost = host.replace(/\./g, "&#8203;.");
	return `
	<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
<title></title><!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style type="text/css">
#outlook a {
padding: 0;
}

body {
margin: 0;
padding: 0;
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
}

table,
td {
border-collapse: collapse;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt;
}

img {
border: 0;
height: auto;
line-height: 100%;
outline: none;
text-decoration: none;
-ms-interpolation-mode: bicubic;
}

p {
display: block;
margin: 13px 0;
}
</style><!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]--><!--[if lte mso 11]>
<style type="text/css">
.mj-outlook-group-fix { width:100% !important; }
</style>
<![endif]--><!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
<style type="text/css">
@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
</style><!--<![endif]-->
<style type="text/css">
@media only screen and (min-width:480px) {
.mj-column-per-100 {
width: 100% !important;
max-width: 100%;
}
}
</style>
<style media="screen and (min-width:480px)">
.moz-text-html .mj-column-per-100 {
width: 100% !important;
max-width: 100%;
}
</style>
<style type="text/css">
@media only screen and (max-width:480px) {
table.mj-full-width-mobile {
width: 100% !important;
}

td.mj-full-width-mobile {
width: auto !important;
}
}
</style>
</head>

<body style="word-spacing:normal;background-color:#0D1117;">
<div style="background-color:#0D1117;">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="rgba(0,0,0,0.06)" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
<div style="background:rgba(0,0,0,0.06);background-color:rgba(0,0,0,0.06);margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
style="background:rgba(0,0,0,0.06);background-color:rgba(0,0,0,0.06);width:100%;">
<tbody>
<tr>
<td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
<div class="mj-column-per-100 mj-outlook-group-fix"
style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
  width="100%">
  <tbody>
	<tr>
	  <td align="center"
		style="font-size:0px;padding:10px 25px;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;word-break:break-word;">
		<table border="0" cellpadding="0" cellspacing="0" role="presentation"
		  style="border-collapse:collapse;border-spacing:0px;">
		  <tbody>
			<tr>
			  <td style="width:100px;"><img alt="" height="auto" src="https://max809.de/max809.webp"
				  style="border:none;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
				  width="100"></td>
			</tr>
		  </tbody>
		</table>
	  </td>
	</tr>
	<tr>
	  <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
		<div
		  style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:35px;line-height:1;text-align:center;color:#ffffff;">
		  Sing in to ${escapedHost}</div>
	  </td>
	</tr>
  </tbody>
</table>
</div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
<div class="mj-column-per-100 mj-outlook-group-fix"
style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
  width="100%">
  <tbody>
	<tr>
	  <td align="center" vertical-align="middle"
		style="font-size:0px;padding:15px 30px;padding-top:10px;padding-right:25px;padding-bottom:10px;padding-left:25px;word-break:break-word;">
		<table border="0" cellpadding="0" cellspacing="0" role="presentation"
		  style="border-collapse:separate;line-height:100%;">
		  <tbody>
			<tr>
			  <td align="center" bgcolor="#1C2B4F" role="presentation"
				style="border:none;border-radius:10px;cursor:auto;mso-padding-alt:10px 25px;background:#1C2B4F;"
				valign="middle"><a href="${url}"
				  style="display:inline-block;background:#1C2B4F;color:#ffffff;font-family:Helvetica;font-size:14px;font-weight:bold;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:10px;"
				  target="_blank">Login</a></td>
			</tr>
		  </tbody>
		</table>
	  </td>
	</tr>
  </tbody>
</table>
</div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
<div class="mj-column-per-100 mj-outlook-group-fix"
style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
  width="100%">
  <tbody>
	<tr>
	  <td align="center"
		style="font-size:0px;padding:10px 25px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;word-break:break-word;">
		<p style="border-top:solid 2px #ffffff;font-size:1px;margin:0px auto;width:100%;"></p><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 2px #ffffff;font-size:1px;margin:0px auto;width:560px;" role="presentation" width="560px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
	  </td>
	</tr>
	<tr>
	  <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
		<div
		  style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#f0f0f0;">
		  If you did not request a login, you can safely ignore this email.</div>
	  </td>
	</tr>
  </tbody>
</table>
</div><!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div><!--[if mso | IE]></td></tr></table><![endif]-->
</div>
</body>

</html>
	
	
	`;
}

/**
 * Helper function to convert "hh:mm" to total minutes
 */
export function toMinutes(time: string): number | null {
	const parts = time.split(":");
	if (parts.length < 2) return null;

	const hours = Number(parts[0]);
	const minutes = Number(parts[1]);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

	return hours * 60 + minutes;
}

export function timeAddition(time1: string, time2: string): string {
	// Convert both times to minutes
	const minutesTime1 = toMinutes(time1);
	const minutesTime2 = toMinutes(time2);

	// If either time is invalid, return an error or handle the case
	if (minutesTime1 === null || minutesTime2 === null) {
		throw new Error("Invalid time format");
	}

	// Calculate the total minutes by adding both times
	let totalMinutes = minutesTime1 + minutesTime2;

	// Modulo 1440 to ensure the time wraps around if greater than 24 hours (24 * 60 = 1440 minutes)
	totalMinutes = totalMinutes % (24 * 60);

	// Convert minutes back to "hh:mm" format
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	// Return the result in "hh:mm" format
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Example usage:
// console.log(timeAddition("10:15", "14:30")); // Output: "00:45" (since it goes over 24 hours)
// console.log(timeAddition("03:40", "02:30")); // Output: "06:10"

export function timeSubtraction(time1: string, time2: string): string {
	// Convert both times to minutes
	const minutesTime1 = toMinutes(time1);
	const minutesTime2 = toMinutes(time2);

	// If either time is invalid, return an error or handle the case
	if (minutesTime1 === null || minutesTime2 === null) {
		throw new Error("Invalid time format");
	}

	// Calculate the difference in minutes
	let diffMinutes = minutesTime1 - minutesTime2;

	// Convert the absolute difference back to "hh:mm" format
	const isNegative = diffMinutes < 0;
	diffMinutes = Math.abs(diffMinutes); // Work with absolute difference for formatting

	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	// Format the result as "hh:mm", adding a negative sign if needed
	const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

	return isNegative ? `-${formattedTime}` : formattedTime;
}

export function timeDifference(startTime: string, endTime: string): string {
	// Convert both times to minutes
	const startMinutes = toMinutes(startTime);
	const endMinutes = toMinutes(endTime);

	// If either time is invalid, return an error or handle the case
	if (startMinutes === null || endMinutes === null) {
		throw new Error("Invalid time format");
	}

	// Calculate the difference in minutes, handling cases where endTime < startTime (crossing midnight)
	let diffMinutes = endMinutes - startMinutes;
	if (diffMinutes < 0) {
		diffMinutes += 24 * 60; // Add 24 hours' worth of minutes to account for crossing midnight
	}

	// Convert minutes back to "hh:mm" format
	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	// Ensure the result is always in "hh:mm" format
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
