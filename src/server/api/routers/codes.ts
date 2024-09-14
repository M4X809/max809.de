import { and, eq, SQL } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { qrCodes } from "~/server/db/schema";

import { PostHog } from "posthog-node";
import { env } from "~/env";
import { loadManifestWithRetries } from "next/dist/server/load-components";

const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
	host: env.NEXT_PUBLIC_POSTHOG_HOST,
});

export const codesRouter = createTRPCRouter({
	createQrCode: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				dataUrl: z.string().optional().default(""),
				qrCode: z.string().min(1),
				qrLvl: z.number().min(0).max(3),
				size: z.number().min(512).max(4096),
				color: z.string().min(1),
				backgroundColor: z.string().min(1),
				finderRadius: z.number().min(0).max(1),
				dotRadius: z.number().min(0).max(1),
				shareable: z.boolean().optional().default(false),
				// }),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, ctx.session.user.id),
			});

			if (!user) {
				client.capture({
					event: "qr-code-generator-save",
					distinctId: ctx.session.user.id,
				});
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const enabled = await client.isFeatureEnabled(
				"qr-code-generator-save",
				ctx.session.user.id,
			);

			if (!enabled) {
				throw new TRPCError({
					code: "SERVICE_UNAVAILABLE",
					message: "This feature is not enabled.",
				});
			}

			const codes = await ctx.db.query.qrCodes.findMany({
				where: (qrCodes, { eq }) => eq(qrCodes.createdById, ctx.session.user.id),
			});

			const nameExists = codes.find((code) => code.name === input.name);

			// console.log(nameExists);

			if (nameExists) {
				client.capture({
					event: "qr-code-generator-save",
					distinctId: ctx.session.user.id,
					properties: {
						updateCode: true,
						saveCode: false,
					},
				});
				await ctx.db
					.update(qrCodes)
					.set({
						name: input.name,
						updatedAt: new Date(),
						dataUrl: input.dataUrl,
						backgroundColor: input.backgroundColor,
						color: input.color,
						dotRadius: input.dotRadius,
						finderRadius: input.finderRadius,
						qrCode: input.qrCode,
						qrLvl: input.qrLvl,
						size: input.size,
						shareable: input.shareable,
					})
					.where(
						and(
							eq(qrCodes.id, nameExists.id),
							eq(qrCodes.createdById, nameExists.createdById),
						),
					);
			} else {
				client.capture({
					event: "qr-code-generator-save",
					distinctId: ctx.session.user.id,
					properties: {
						updateCode: false,
						saveCode: true,
					},
				});

				if (codes.length >= user?.limit) {
					client.capture({
						event: "qr-code-generator-save-limit",
						distinctId: ctx.session.user.id,
						properties: {
							updateCode: false,
							saveCode: true,
							limit: user?.limit,
							count: codes.length,
						},
					});
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You have reached the maximum number of saved QR codes. Please delete some before creating a new one.",
					});
				}

				await ctx.db.insert(qrCodes).values({
					name: input.name,
					createdById: ctx.session.user.id,
					dataUrl: input.dataUrl,
					qrCode: input.qrCode,
					qrLvl: input.qrLvl,
					size: input.size,
					color: input.color,
					backgroundColor: input.backgroundColor,
					finderRadius: input.finderRadius,
					dotRadius: input.dotRadius,
					shareable: input.shareable,

					// data: JSON.stringify(input.data),
				});
			}
		}),
	getQrCodes: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const user = await ctx.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		});

		const result = await ctx.db.query.qrCodes.findMany({
			where: (qrCodes, { eq }) => eq(qrCodes.createdById, userId),
			orderBy: (qrCodes, { desc }) => desc(qrCodes.createdAt),
		});

		return {
			codes: result,
			limits: {
				current: result.length,
				max: user?.limit,
			},
		};
	}),
	getLimits: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const result = await ctx.db.query.users.findFirst({
			where: (qrCodes, { eq }) => eq(qrCodes.id, userId),
		});

		const count = await ctx.db.query.qrCodes.findMany({
			where: (qrCodes, { eq }) => eq(qrCodes.createdById, userId),
		});

		return {
			current: count.length,
			max: result?.limit,
		};
	}),
	getQrCodeWithID: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const code = await ctx.db.query.qrCodes.findFirst({
				where: (qrCodes, { eq }) => eq(qrCodes.id, input),
			});
			if (!code) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No QR Code found with that ID.",
				});
			}
			if (!code.shareable) {
				return new TRPCError({
					code: "FORBIDDEN",
					message: "This QR Code is not shareable.",
				});
			}

			const createdBy = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, code.createdById),
			});

			return { ...code, createdBy: createdBy?.name };
		}),
});
