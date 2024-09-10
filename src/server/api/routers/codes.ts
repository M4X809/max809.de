import { SQL } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import { qrCodes } from "~/server/db/schema";

export const codesRouter = createTRPCRouter({
	createQrCode: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				// data: z.object({
				qrCode: z.string().min(1),
				qrLvl: z.number().min(0).max(3),
				size: z.number().min(512).max(4096),
				color: z.string().min(1),
				backgroundColor: z.string().min(1),
				finderRadius: z.number().min(0).max(1),
				dotRadius: z.number().min(0).max(1),
				// }),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(qrCodes).values({
				name: input.name,
				createdById: ctx.session.user.id,
				qrCode: input.qrCode,
				qrLvl: input.qrLvl,
				size: input.size,
				color: input.color,
				backgroundColor: input.backgroundColor,
				finderRadius: input.finderRadius,
				dotRadius: input.dotRadius,

				// data: JSON.stringify(input.data),
			});
		}),
	getQrCodes: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const result = await ctx.db.query.qrCodes.findMany({
			where: (qrCodes, { eq }) => eq(qrCodes.createdById, userId),
			orderBy: (qrCodes, { desc }) => desc(qrCodes.createdAt),
		});

		return result;
	}),
});
