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