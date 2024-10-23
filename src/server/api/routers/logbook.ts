import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { hasPermission, isAdmin } from "~/lib/sUtils";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { logbookFeed, loginWhitelist, sessions } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "full" });

export const logbookRouter = createTRPCRouter({
	createEntry: protectedProcedure
		.input(
			z.object({
				type: z.enum(["entry", "start", "end", "pause"]).default("entry"),
				streetName: z.string().optional().default(""),
				kmState: z.string().optional().default(""),
				startTime: z.date().optional(),
				endTime: z.date().optional(),
				date: z.date(),
				note: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const startTime = input.startTime ? new Date(input.startTime) : null;
			const endTime = input.endTime ? new Date(input.endTime) : null;

			await ctx.db
				.insert(logbookFeed)
				.values({
					createdById: ctx.session.user.id,
					type: input.type,
					streetName: input.streetName,
					kmState: input.kmState,
					startTime,
					endTime,
					date: input.date,
					note: input.note,
				})
				.execute();

			return {
				success: true,
			};
		}),

	updateEntry: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				type: z.enum(["entry", "start", "end", "pause"]),
				streetName: z.string().optional().default(""),
				kmState: z.string().optional().default(""),
				startTime: z.date().optional(),
				endTime: z.date().optional(),
				date: z.date(),
				note: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}
			const entry = await ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq }) => eq(logbookFeed.id, input.id),
			});
			if (!entry) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No Entry found with that ID.",
				});
			}
			await ctx.db
				.update(logbookFeed)
				.set({
					type: input.type ?? entry.type,
					streetName: input.streetName ?? entry.streetName,
					kmState: input.kmState ?? entry.kmState,
					startTime: input.startTime ?? entry.startTime,
					endTime: input.endTime ?? entry.endTime,
					date: input.date ?? entry.date,
					note: input.note ?? entry.note,
				})
				.where(eq(logbookFeed.id, input.id))
				.execute();

			return {
				success: true,
			};
		}),

	getEntries: protectedProcedure
		.input(
			z.object({
				// dd.mm.yyyy or d.m.yyyy (d = day, m = month, yyyy = year)
				// day: z.string().regex(/^\d{2}\.\d{1 , 2}\.\d{4}$/),
				day: z.string().regex(/^\d{1,2}[./]\d{1,2}[./]\d{4}$/),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			input.day = input.day.replaceAll("/", ".");

			console.log("input", input);

			const [day, month, year] = input.day.split(".").map(Number);

			const startDate = new Date(year!, month! - 1, day, 0, 0, 0);
			const endDate = new Date(year!, month! - 1, day, 23, 59, 59);

			const entriesProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "entry"), eq(logbookFeed.type, "pause")),
					),
				orderBy: (logbookFeed, { desc, asc }) => asc(logbookFeed.startTime),
			});

			const startAndEndTimeProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const previousStreetNamesProm = ctx.db.query.logbookFeed
				.findMany({
					columns: { streetName: true },
					orderBy: (logbookFeed, { desc }) => desc(logbookFeed.streetName),
				})
				.then((result) => result.map((entry) => entry.streetName))
				.then((result) =>
					result.filter((value, index, self) => self.indexOf(value) === index),
				)
				.then((result) => result.filter(Boolean));

			const [startAndEndTime, previousStreetNames, entries] = await Promise.all([
				startAndEndTimeProm,
				previousStreetNamesProm,
				entriesProm,
			]);

			// console.log("entries", entries);
			// console.log("startAndEndTime", startAndEndTime);

			return {
				day: new Date(year!, month! - 1, day),
				streetNames: previousStreetNames,
				startTime: startAndEndTime.find((entry) => entry.type === "start"),
				endTime: startAndEndTime.find((entry) => entry.type === "end"),
				entries: entries.map((entry) => {
					return {
						date: entry.date,
						id: entry.id,
						createdById: entry.createdById,
						createdAt: entry.createdAt,
						type: entry.type,
						streetName: entry.streetName,
						kmState: entry.kmState,
						startTime: entry.startTime,
						endTime: entry.endTime,
						note: entry.note,
					};
				}),
			};
		}),
	getEntryById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				return new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}
			const entryProm = ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq }) => eq(logbookFeed.id, input.id),
			});

			const previousStreetNamesProm = ctx.db.query.logbookFeed
				.findMany({
					columns: { streetName: true },
					orderBy: (logbookFeed, { desc }) => desc(logbookFeed.streetName),
				})
				.then((result) => result.map((entry) => entry.streetName))
				.then((result) =>
					result.filter((value, index, self) => self.indexOf(value) === index),
				)
				.then((result) => result.filter(Boolean));

			const [entry, previousStreetNames] = await Promise.all([
				entryProm,
				previousStreetNamesProm,
			]);

			if (!entry) {
				return new TRPCError({
					code: "NOT_FOUND",
					message: "No Entry found with that ID.",
				});
			}
			return {
				previousStreetNames,
				id: entry.id,
				createdById: entry.createdById,
				createdAt: entry.createdAt,
				type: entry.type,
				streetName: entry.streetName,
				kmState: entry.kmState,
				startTime: entry.startTime,
				endTime: entry.endTime,
				note: entry.note,
				date: entry.date,
			};
		}),

	deleteEntry: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}
			const entry = await ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq }) => eq(logbookFeed.id, input.id),
			});
			if (!entry) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No Entry found with that ID.",
				});
			}
			await ctx.db
				.delete(logbookFeed)
				.where(eq(logbookFeed.id, input.id))
				.execute();
			return {
				success: true,
			};
		}),
});
