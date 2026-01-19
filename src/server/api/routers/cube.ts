import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { cubeTimes } from "~/server/db/schema";

export const cubeRouter = createTRPCRouter({
	createCubeTime: protectedProcedure
		.input(
			z.object({
				cubeSize: z.string().min(1).max(100),
				scramble: z.string().min(1),
				time: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}
			console.log("input", input);
			await ctx.db.insert(cubeTimes).values({
				createdById: ctx.session.user.id,
				cubeSize: input.cubeSize,
				scramble: input.scramble,
				time: input.time,
			});
			return {
				success: true,
			};
		}),
	getCubeTimeHistory: protectedProcedure
		.input(
			z.object({
				cubeSize: z.string().min(1).max(100),
				page: z.number().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const history = await ctx.db.query.cubeTimes.findMany({
				where: (cubeTimes, { eq, and }) =>
					and(eq(cubeTimes.cubeSize, input.cubeSize), eq(cubeTimes.createdById, ctx.session.user.id)),
				orderBy: (cubeTimes, { desc }) => desc(cubeTimes.createdAt),
				columns: {
					id: true,
					createdAt: true,
					cubeSize: true,
					scramble: true,
					time: true,
				},
				offset: (input.page - 1) * 10,
				limit: 10,
			});

			const total = await ctx.db.query.cubeTimes.findMany({
				where: (cubeTimes, { eq, and }) =>
					and(eq(cubeTimes.cubeSize, input.cubeSize), eq(cubeTimes.createdById, ctx.session.user.id)),
				columns: { id: true },
			});

			// console.log("total", total);

			return {
				history: history,
				page: input.page,
				totalPages: Math.ceil(total.length / 10),
				total: total.length,
			};
		}),
	deleteCubeTime: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const code = await ctx.db
				.delete(cubeTimes)
				.where(and(eq(cubeTimes.id, input.id), eq(cubeTimes.createdById, ctx.session.user.id)))
				.execute();
			if (!code) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No QR Code found with that ID.",
				});
			}

			return {
				success: true,
			};
		}),
});
