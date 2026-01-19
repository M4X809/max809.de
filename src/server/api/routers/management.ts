import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { checkConf, hasPermission, isAdmin, setNestedValue } from "~/lib/sUtils";
import { qrCodes, sessions, users } from "~/server/db/schema";

import { allPerms, blockedPerms, dangerPerms, disabledPerms } from "~/permissions";

import { revalidatePath } from "next/cache";
import { utapi } from "~/server/uploadthing";

export const managementRouter = createTRPCRouter({
	getUsers: protectedProcedure.query(async ({ ctx }) => {
		if (!(await hasPermission("viewUser"))) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You are not authorized to perform this action.",
			});
		}

		const users = await ctx.db.query.users.findMany({
			columns: { email: false, limit: false },
			orderBy: (users, { desc }) => [desc(users.admin), desc(users.staff)],
		});

		return users;
	}),
	getUser: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
		if (!(await hasPermission("viewUserPage"))) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You are not authorized to perform this action.",
			});
		}

		const user = await ctx.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, input),
		});
		if (!user) {
			console.warn("No User was Found");
			return undefined;
		}

		return user;
	}),
	updatePermissions: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				permissions: z.string().array(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("editUserPermissions"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const arraySchema = z.array(z.string());

			const inputPerms = arraySchema.safeParse(input.permissions);
			const validateArray2 = arraySchema.safeParse(ctx.session.user.permissions);

			if (!inputPerms.success || !validateArray2.success) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid permissions array.",
				});
			}
			function isPermissionValid(allPerms: any[], permsArray: string[]): string[] {
				const flattenedPerms: string[] = [];
				for (const category of allPerms) {
					for (const perm of category.perms) {
						flattenedPerms.push(perm.perm);
						if (perm.children) {
							for (const childPerm of perm.children) {
								flattenedPerms.push(childPerm.perm);
							}
						}
					}
				}
				const invalidPerms: string[] = permsArray.filter((perm) => flattenedPerms.includes(perm));
				// Print.Info("Invalid Permissions:", invalidPerms)({});
				return invalidPerms;
			}

			const validPerms = isPermissionValid(allPerms, inputPerms.data);
			console.log("validPerms", validPerms);

			const validWithoutDanger = validPerms.filter((perm) => !dangerPerms.includes(perm));

			const hasAllPermissions = validWithoutDanger.every((perm) => validateArray2.data.includes(perm));

			if (!hasAllPermissions && !ctx.session.user.admin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have all the permissions.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}

			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Admins)",
				});
			}

			if (user.id === ctx.session.user.id && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}

			const currentDangerousPerms = user.permissions.filter((perm) => dangerPerms.includes(perm));

			const validWithDanger = validPerms
				.filter((perm) => dangerPerms.includes(perm))
				.filter((perm) => !blockedPerms.includes(perm));

			if (await hasPermission("dangerousPermissions")) {
				if (await isAdmin()) {
					await ctx.db
						.update(users)
						.set({
							permissions: validPerms,
						})
						.where(eq(users.id, input.id))
						.execute();

					return {
						status: "success",
					};
				}

				console.log(blockedPerms);

				const currentBlockedPerms = user.permissions
					.filter((perm) => blockedPerms.includes(perm))
					.filter((value, index, self) => self.indexOf(value) === index);

				const finishedPerms = [
					...validWithoutDanger,
					...currentBlockedPerms,
					...validWithDanger,
					...currentBlockedPerms,
				].filter((value, index, self) => self.indexOf(value) === index);
				// console.log(
				// 	chalk.yellow("__________________________________________________________"),
				// );
				// console.log("validWithoutDanger", validWithoutDanger);
				// console.log("currentBlockedPerms", currentBlockedPerms);
				// console.log("validWithDanger", validWithDanger);
				// console.log("currentBlockedPerms", currentBlockedPerms);

				// console.log("finishedPerms", finishedPerms);

				// console.log(
				// 	chalk.yellow("__________________________________________________________"),
				// );

				await ctx.db
					.update(users)
					.set({
						permissions: finishedPerms,
					})
					.where(eq(users.id, input.id))
					.execute();

				return {
					status: "success",
				};
			}

			// console.log(
			// 	chalk.yellow("__________________________________________________________"),
			// );
			// console.log("currentDangerousPerms", currentDangerousPerms);

			// spread all into one array an remove duplicates
			const finishedPerms = [
				...validWithoutDanger,
				// ...validWithDanger,
				...currentDangerousPerms,
			].filter((value, index, self) => self.indexOf(value) === index);

			// console.log(chalk.green("VALID PERMS"), finishedPerms);

			// console.log(
			// 	chalk.yellow("__________________________________________________________"),
			// );

			if (validPerms.toString() === user.permissions.toString()) {
				return {
					status: "no-change",
				};
			}

			await ctx.db
				.update(users)
				.set({
					permissions: finishedPerms.filter((perm) => !disabledPerms.includes(perm)),
				})
				.where(eq(users.id, input.id))
				.execute();

			// console.log("ret", command);

			return {
				status: "success",
			};
		}),
	resetPermissions: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("resetPermissions"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Admins)",
				});
			}
			if (user.id === ctx.session.user.id && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}

			await ctx.db
				.update(users)
				.set({
					permissions: [],
				})
				.where(eq(users.id, input.id))
				.execute();

			return {
				status: "success",
			};
		}),

	updateStaffRole: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				staff: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("setStaff"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit admin)",
				});
			}
			if (user.id === ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}
			if (user.name === "max809" && user.id !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot Change the Staff Role of max809",
				});
			}

			await ctx.db
				.update(users)
				.set({
					staff: input.staff,
				})
				.where(eq(users.id, input.id))
				.execute();

			return {
				status: "success",
			};
		}),

	updateAdminRole: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				admin: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("setAdmin"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit admin)",
				});
			}

			if (user.id === ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}

			if (user.name === "max809" && user.id !== ctx.session.user.id) {
				// const reqUser = await ctx.db.query.users.findFirst({
				// 	where: (users, { eq }) => eq(users.id, ctx.session.user.id),
				// });

				const prom1 = ctx.db
					.update(users)
					.set({
						admin: false,
						staff: false,
						permissions: [],
					})
					.where(eq(users.id, ctx.session.user.id))
					.execute();

				const prom2 = ctx.db.delete(sessions).where(eq(sessions.userId, ctx.session.user.id)).execute();

				await Promise.all([prom1, prom2]);

				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot Change the Admin Role of max809! Removing your Admin Status...",
				});
			}

			await ctx.db
				.update(users)
				.set({
					admin: input.admin,
					staff: input.admin ? true : user.staff,
				})
				.where(eq(users.id, input.id))
				.execute();

			return {
				status: "success",
			};
		}),
	logoutAllDevices: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("logoutAllDevices"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Admins)",
				});
			}

			await ctx.db.delete(sessions).where(eq(sessions.userId, input.id)).execute();

			return {
				status: "success",
			};
		}),

	// QR CODE MANAGEMENT

	getQrCodeData: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		if (!(await hasPermission("viewQrStats"))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not authorized to perform this action.",
			});
		}
		const user = await ctx.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, input.id),
			columns: { id: true, limit: true },
		});

		const viewQrPreview = await hasPermission("viewQrPreview");

		const codes = await ctx.db.query.qrCodes.findMany({
			where: (qrCodes, { eq }) => eq(qrCodes.createdById, input.id),
			orderBy: (qrCodes, { desc }) => desc(qrCodes.createdAt),
			columns: {
				id: true,
				name: true,
				createdAt: true,
				qrCode: viewQrPreview,
				shareable: true,
			},
		});

		type codeType = {
			id: string;
			name: string | null;
			createdAt: Date;
			qrCode?: string | null;
			shareable: boolean | null;
		}[];

		return {
			id: user?.id,
			limit: user?.limit,
			codes: codes as codeType,
		};
	}),

	getPreviewQr: protectedProcedure
		.input(
			z.object({
				qrId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!(await hasPermission("viewQrPreview"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const code = await ctx.db.query.qrCodes.findFirst({
				where: (qrCodes, { eq }) => eq(qrCodes.id, input.qrId),
			});

			if (!code) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No QR Code found with that ID.",
				});
			}

			return code;
		}),

	updateQrLimit: protectedProcedure
		.input(z.object({ id: z.string(), limit: z.number() }))
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("changeQrLimits"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Admin)",
				});
			}

			if (user.id === ctx.session.user.id && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}

			await ctx.db
				.update(users)
				.set({
					limit: input.limit,
				})
				.where(eq(users.id, input.id))
				.execute();

			revalidatePath(`/dashboard/user/${input.id}`);

			return {
				status: "success",
			};
		}),
	deleteQrCode: protectedProcedure
		.input(
			z.object({
				qrId: z.string(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("deleteQrCode"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.userId),
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}
			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Admins)",
				});
			}

			const code = await ctx.db.query.qrCodes.findFirst({
				where: (qrCodes, { eq, and }) => and(eq(qrCodes.id, input.qrId), eq(qrCodes.createdById, input.userId)),
			});

			if (!code) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No QR Code found with that ID.",
				});
			}

			if (code.imageKey) {
				const response = await utapi.deleteFiles([code.imageKey]);
				if (!response.success) {
					console.log("response", response);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"There was an error deleting the file. Please try again later. If the problem persists, please contact the administrator.",
					});
				}
			}

			try {
				await ctx.db.delete(qrCodes).where(and(eq(qrCodes.id, input.qrId), eq(qrCodes.createdById, input.userId)));
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"There was an error deleting the QR Code. Please try again later. If the problem persists, please contact the administrator.",
				});
			}

			revalidatePath(`/dashboard/user/${input.userId}`);
			return {
				success: true,
			};
		}),

	updateLoginWithEmail: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				allowSigninWithEmail: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("editUser"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, input.userId),
			});

			if (!user) {
				throw new TRPCError({
					message: "User not Found with that ID.",
					code: "NOT_FOUND",
				});
			}

			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					message: "You are not authorized to perform this action. (Edit Admins)",
					code: "FORBIDDEN",
				});
			}

			await ctx.db
				.update(users)
				.set({
					allowSigninWithEmail: input.allowSigninWithEmail,
				})
				.where(eq(users.id, input.userId))
				.execute();

			return {
				success: true,
			};
		}),
	setConfig: protectedProcedure
		.input(
			z.object({
				path: z.string(),
				value: z
					.string()
					.or(z.boolean())
					.or(z.number().or(z.array(z.string()))),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("editUser"))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, ctx.session.user.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}

			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const newConf = setNestedValue(user.config, input.path, input.value);
			const checkedConfig = checkConf(newConf);
			await ctx.db
				.update(users)
				.set({
					config: checkedConfig.data ?? (user.config as any),
				})
				.where(eq(users.id, input.userId))
				.execute();

			return {
				status: "success",
			};
		}),
});
