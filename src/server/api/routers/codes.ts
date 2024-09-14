import { and, eq } from "drizzle-orm";
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
import { utapi } from "~/server/uploadthing";
import { dataURLtoFile } from "image-conversion";

import {} from "uploadthing/server";
import type { UploadFileResult } from "uploadthing/types";

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
			console.log("input", input);
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
				console.log("nameExists", nameExists);
				client.capture({
					event: "qr-code-generator-save",
					distinctId: ctx.session.user.id,
					properties: {
						updateCode: true,
						saveCode: false,
					},
				});
				const oldImageKey = nameExists.imageKey; 

				let delPromise: Promise<{
					readonly success: boolean;
					readonly deletedCount: number;
				}> = Promise.resolve({ success: true, deletedCount: 1 });

				if (oldImageKey) {
					delPromise = utapi.deleteFiles([oldImageKey]);
					// console.log("delPromise", delPromise);
				}

				let uploadProm = Promise.resolve({
					error: null,
					data: true,
				}) as unknown as Promise<UploadFileResult>;

				if (input.shareable) {
					const imageFile = await dataURLtoFile(input.dataUrl, "image/png" as any);
					uploadProm = utapi.uploadFiles(
						new File([imageFile], `${input.name}-${user.id}.png`, {
							type: "image/png",
						}),
					);
				}

				const [uploadData, delData] = await Promise.all([uploadProm, delPromise]);
				console.dir({ uploadData: uploadData, delData: delData });

				if (uploadData.error || !uploadData.data) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"There was an error uploading the file. Please try again later. If the problem persists, please contact the administrator.",
					});
				}

				await ctx.db
					.update(qrCodes)
					.set({
						name: input.name,
						updatedAt: new Date(),
						// dataUrl: data.appUrl,
						backgroundColor: input.backgroundColor,
						color: input.color,
						dotRadius: input.dotRadius,
						finderRadius: input.finderRadius,
						qrCode: input.qrCode,
						qrLvl: input.qrLvl,
						size: input.size,
						shareable: input.shareable,
						imageKey: uploadData.data.key,
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

				let uploadProm = Promise.resolve({
					error: null,
					data: true,
				}) as unknown as Promise<UploadFileResult>;

				if (input.shareable) {
					const imageFile = await dataURLtoFile(input.dataUrl, "image/png" as any);
					uploadProm = utapi.uploadFiles(
						new File([imageFile], `${input.name}-${user.id}.png`, {
							type: "image/png",
						}),
					);
				}

				const uploadData = await uploadProm;

				if (uploadData.error || !uploadData.data) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							"There was an error uploading the file. Please try again later. If the problem persists, please contact the administrator.",
					});
				}

				await ctx.db.insert(qrCodes).values({
					name: input.name,
					createdById: ctx.session.user.id,
					dataUrl: null,
					qrCode: input.qrCode,
					qrLvl: input.qrLvl,
					size: input.size,
					color: input.color,
					backgroundColor: input.backgroundColor,
					finderRadius: input.finderRadius,
					dotRadius: input.dotRadius,
					shareable: input.shareable,
					// imageKey: uploadData?.data.key || null,

					// data: JSON.stringify(input.data),
				});
				return;
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
				return new TRPCError({
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

	uploadQrCodeImage: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const code = await ctx.db.query.qrCodes.findFirst({
				where: (qrCodes, { eq }) => eq(qrCodes.id, input.id),
			});

			if (!code || !code.dataUrl || code.imageKey || !code.shareable) {
				return {
					success: false,
					keyExists: !!code?.imageKey,
					shareable: code?.shareable,
				};
			}

			const imageFile = await dataURLtoFile(code.dataUrl, "image/png" as any);

			const uploadData = await utapi.uploadFiles(
				new File([imageFile], `${code.name}-${code.createdById}.png`, {
					type: "image/png",
				}),
			);

			if (uploadData.error || !uploadData.data) {
				return new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"There was an error uploading the file. Please try again later. If the problem persists, please contact the administrator.",
				});
			}

			await ctx.db
				.update(qrCodes)
				.set({
					imageKey: uploadData.data.key,
					dataUrl: null,
				})
				.where(
					and(eq(qrCodes.id, input.id), eq(qrCodes.createdById, code.createdById)),
				);

			return {
				success: true,
			};
		}),
});
