import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
	hasPermission,
	isAdmin,
	timeAddition,
	timeDifference,
	timeSubtraction,
} from "~/lib/sUtils";
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
				unpaidBreak: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const date = input.date.toLocaleDateString("de-DE");

			const [day, month, year] = date.split(".").map(Number);

			const startDate = new Date(year!, month! - 1, day, 0, 0, 0);
			const endDate = new Date(year!, month! - 1, day, 23, 59, 59);

			const startAndEndTimeProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const [startAndEndTime] = await Promise.all([startAndEndTimeProm]);

			const startTime = startAndEndTime.find((entry) => entry.type === "start");
			const endTime = startAndEndTime.find((entry) => entry.type === "end");

			if (input.type === "start" && startTime) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Startzeitpunkt pro Tag haben.",
				});
			}

			if (input.type === "end" && endTime) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Endzeitpunkt pro Tag haben.",
				});
			}

			await ctx.db
				.insert(logbookFeed)
				.values({
					createdById: ctx.session.user.id,
					type: input.type,
					streetName: input.streetName,
					kmState: input.kmState,
					startTime: input.startTime,
					endTime: input.endTime,
					date: input.date,
					note: input.note,
					unpaidBreak: input.unpaidBreak,
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
				unpaidBreak: z.boolean().optional(),
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

			const date = input.date.toLocaleDateString("de-DE");

			const [day, month, year] = date.split(".").map(Number);

			const startDate = new Date(year!, month! - 1, day, 0, 0, 0);
			const endDate = new Date(year!, month! - 1, day, 23, 59, 59);

			const startAndEndTimeProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const [startAndEndTime] = await Promise.all([startAndEndTimeProm]);

			const startTime = startAndEndTime.find((entry) => entry.type === "start");
			const endTime = startAndEndTime.find((entry) => entry.type === "end");

			if (input.type === "start" && startTime?.id !== entry.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Startzeitpunkt pro Tag haben.",
				});
			}

			if (input.type === "end" && endTime?.id !== entry.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Endzeitpunkt pro Tag haben.",
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
					unpaidBreak: input.unpaidBreak ?? entry.unpaidBreak,
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
				orderBy: (logbookFeed, { asc }) => asc(logbookFeed.startTime),
			});

			const unpaidBreaksProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						and(eq(logbookFeed.type, "pause"), eq(logbookFeed.unpaidBreak, true)),
					),
				orderBy: (logbookFeed, { asc }) => asc(logbookFeed.startTime),
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
				.then((result) => result.filter(Boolean))
				.then((result) => result.sort((a, b) => a.localeCompare(b)));

			const [startAndEndTime, unpaidBreaks, previousStreetNames, entries] =
				await Promise.all([
					startAndEndTimeProm,
					unpaidBreaksProm,
					previousStreetNamesProm,
					entriesProm,
				]);

			const startTime = startAndEndTime.find((entry) => entry.type === "start");
			const endTime = startAndEndTime.find((entry) => entry.type === "end");

			const totalWorkTime = () => {
				let unpaidBreaksTime = "00:00";
				if (unpaidBreaks.length > 0) {
					for (const breakEntry of unpaidBreaks) {
						if (!breakEntry.startTime || !breakEntry.endTime) continue;
						const entryTime = timeDifference(
							breakEntry.startTime?.toLocaleTimeString("de-DE"),
							breakEntry.endTime?.toLocaleTimeString("de-DE"),
						);
						unpaidBreaksTime = timeAddition(unpaidBreaksTime, entryTime);
					}
				}

				if (!startTime?.startTime || !endTime?.endTime) return "Error";

				const dayTime = timeDifference(
					startTime.startTime
						?.toLocaleTimeString("de-DE")
						.split(":")
						.slice(0, 2)
						.join(":"),
					endTime.endTime
						?.toLocaleTimeString("de-DE")
						.split(":")
						.slice(0, 2)
						.join(":"),
				);

				return timeSubtraction(dayTime, unpaidBreaksTime);
			};

			// console.log("totalWorkTime", totalWorkTime());

			// console.log("entries", entries);
			// console.log("startAndEndTime", startAndEndTime);

			return {
				day: new Date(year!, month! - 1, day),
				streetNames: previousStreetNames,
				totalWorkTime: totalWorkTime(),
				startTime,
				endTime,
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
						unpaidBreak: entry.unpaidBreak,
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
				unpaidBreak: entry.unpaidBreak,
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
