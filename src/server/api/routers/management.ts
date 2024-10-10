import { and, eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission, isAdmin } from "~/lib/utils";
import { users } from "~/server/db/schema";

import {
	allPerms,
	blockedPerms,
	dangerPerms,
	disabledPerms,
	perms,
} from "~/permissions";

import chalk from "chalk";

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
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "No user found with that ID.",
			});
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
				const invalidPerms: string[] = permsArray.filter((perm) =>
					flattenedPerms.includes(perm),
				);
				// Print.Info("Invalid Permissions:", invalidPerms)({});
				return invalidPerms;
			}

			const validPerms = isPermissionValid(allPerms, inputPerms.data);
			console.log("validPerms", validPerms);

			const validWithoutDanger = validPerms.filter(
				(perm) => !dangerPerms.includes(perm),
			);

			const hasAllPermissions = validWithoutDanger.every((perm) =>
				validateArray2.data.includes(perm),
			);

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
					message: "You are not authorized to perform this action.",
				});
			}

			if (user.id === ctx.session.user.id && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const currentDangerousPerms = user.permissions.filter((perm) =>
				dangerPerms.includes(perm),
			);

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
});
