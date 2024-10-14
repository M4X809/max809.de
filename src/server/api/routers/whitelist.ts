import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { hasPermission, isAdmin } from "~/lib/sUtils";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { loginWhitelist, sessions } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const whitelistRouter = createTRPCRouter({
	getWhitelist: protectedProcedure
		.input(
			z.object({
				page: z.number().optional().default(1),
				limit: z.number().optional().default(10),
				search: z.string().optional().default(""),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!(await hasPermission("viewWhitelist"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const totalRowsProm = ctx.db.query.loginWhitelist
				.findMany({
					where: (loginWhitelist, { ilike, or }) =>
						input.search.length > 0
							? or(
									ilike(loginWhitelist.email, `%${input.search}%`),
									ilike(loginWhitelist.oAuthProviderAccountId, `%${input.search}%`),
									ilike(loginWhitelist.userId, `%${input.search}%`),
									ilike(loginWhitelist.oAuthProvider, `%${input.search}%`),
								)
							: undefined,
					columns: { whiteListId: true },
				})
				.execute();

			const whitelistProm = ctx.db.query.loginWhitelist
				.findMany({
					where: (loginWhitelist, { ilike, or }) =>
						input.search.length > 0
							? or(
									ilike(loginWhitelist.email, `%${input.search}%`),
									ilike(loginWhitelist.oAuthProviderAccountId, `%${input.search}%`),
									ilike(loginWhitelist.userId, `%${input.search}%`),
									ilike(loginWhitelist.oAuthProvider, `%${input.search}%`),
								)
							: undefined,
					orderBy: (loginWhitelist, { desc }) => [
						desc(loginWhitelist.lastLogin),
						desc(loginWhitelist.allowed),
					],
					offset: (input.page - 1) * input.limit,
					limit: input.limit,
				})
				.execute();

			const [whitelist, totalRows] = await Promise.all([
				whitelistProm,
				totalRowsProm,
			]);

			return {
				data: whitelist,
				total: totalRows.length,
				showing: whitelist.length,
				page: input.page,
			};
		}),
	changeStatus: protectedProcedure
		.input(
			z.object({
				whiteListId: z.string(),
				allowed: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("editWhitelistStatus"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const whitelist = await ctx.db.query.loginWhitelist.findFirst({
				where: (loginWhitelist, { eq }) =>
					eq(loginWhitelist.whiteListId, input.whiteListId),
			});

			if (!whitelist) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No whitelist entry found with that Email.",
				});
			}

			if (whitelist.userId === ctx.session.user.id && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action. (Edit Self)",
				});
			}

			if (whitelist.userId && input.allowed === false) {
				const dbUser = await ctx.db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, whitelist.userId!),
				});

				if (!dbUser?.admin) {
					await ctx.db
						.delete(sessions)
						.where(eq(sessions.userId, whitelist.userId))
						.execute();
				}
			}

			await ctx.db
				.update(loginWhitelist)
				.set({
					allowed: input.allowed,
					new: false,
				})
				.where(eq(loginWhitelist.whiteListId, input.whiteListId))
				.execute();

			return {
				success: true,
			};
		}),
});
