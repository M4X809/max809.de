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
import { eq, or, sql } from "drizzle-orm";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { DayData } from "~/app/(staff)/dashboard/logbook/full-screen-calendar";
import { de } from "date-fns/locale";

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
				where: (logbookFeed, { eq, between, and, or, not }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
						not(eq(logbookFeed.deleted, true)),
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
				where: (logbookFeed, { eq, between, and, or, not }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const [startAndEndTime] = await Promise.all([startAndEndTimeProm]);

			const startTime = startAndEndTime.find((entry) => entry.type === "start");
			const endTime = startAndEndTime.find((entry) => entry.type === "end");

			if (input.type === "start" && startTime?.id !== entry.id && startTime) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Startzeitpunkt pro Tag haben.",
				});
			}

			if (input.type === "end" && endTime?.id !== entry.id && endTime) {
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
			const [day, month, year] = input.day.split(".").map(Number);

			const startDate = new Date(year!, month! - 1, day, 0, 0, 0);
			const endDate = new Date(year!, month! - 1, day, 23, 59, 59);

			const entriesProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or, not }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "entry"), eq(logbookFeed.type, "pause")),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: (logbookFeed, { asc }) => asc(logbookFeed.startTime),
			});

			const unpaidBreaksProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, not }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						and(eq(logbookFeed.type, "pause"), eq(logbookFeed.unpaidBreak, true)),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: (logbookFeed, { asc }) => asc(logbookFeed.startTime),
			});

			const startAndEndTimeProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or, not }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const previousStreetNamesProm = ctx.db.query.logbookFeed
				.findMany({
					columns: { streetName: true },
					orderBy: (logbookFeed, { desc }) => desc(logbookFeed.streetName),
					where: (logbookFeed, { not, eq }) => not(eq(logbookFeed.deleted, true)),
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
				where: (logbookFeed, { eq, and, not }) =>
					and(eq(logbookFeed.id, input.id), not(eq(logbookFeed.deleted, true))),
			});

			const previousStreetNamesProm = ctx.db.query.logbookFeed
				.findMany({
					columns: { streetName: true },
					orderBy: (logbookFeed, { desc }) => desc(logbookFeed.streetName),
					where: (logbookFeed, { not, eq }) => not(eq(logbookFeed.deleted, true)),
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
					message: "Es wurde kein eintrag mit dieser ID gefunden.",
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
				where: (logbookFeed, { eq, and, not }) =>
					and(eq(logbookFeed.id, input.id), not(eq(logbookFeed.deleted, true))),
			});
			if (!entry) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Es wurde kein eintrag mit dieser ID gefunden. (Es könnte bereits gelöscht sein.)",
				});
			}

			await ctx.db
				.update(logbookFeed)
				.set({ deleted: true })
				.where(eq(logbookFeed.id, input.id))
				.execute();

			return {
				success: true,
			};
		}),
	getMonthlyData: protectedProcedure
		.input(z.object({ date: z.string().regex(/^\d{1,2}[./]\d{1,2}[./]\d{4}$/) }))
		.query(async ({ ctx, input }) => {
			if (!(await hasPermission("viewLogbookFeed"))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to perform this action.",
				});
			}

			const [day, month, year] = input.date.split(".").map(Number);

			const currentMonth = new Date(year!, month! - 1, day);
			const monthStart = startOfMonth(currentMonth);
			const monthEnd = endOfMonth(monthStart);

			console.log("monthStart", monthStart);
			console.log("monthEnd", monthEnd);

			const startAndEndTimeProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, or, not }) =>
					and(
						between(logbookFeed.date, monthStart, monthEnd),
						or(eq(logbookFeed.type, "start"), eq(logbookFeed.type, "end")),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: (logbookFeed, { desc }) => desc(logbookFeed.type),
			});

			const unpaidBreaksProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, not }) =>
					and(
						between(logbookFeed.date, monthStart, monthEnd),
						eq(logbookFeed.unpaidBreak, true),
						not(eq(logbookFeed.deleted, true)),
					),
			});

			const [startAndEndTime, unpaidBreaks] = await Promise.all([
				startAndEndTimeProm,
				unpaidBreaksProm,
			]);

			// console.log("entries", startAndEndTime);

			// Group entries by date
			const entriesByDate = startAndEndTime.reduce(
				(acc, entry) => {
					if (!entry.date) return acc;

					const dateKey = format(entry.date, "dd.MM.yyyy", { locale: de });
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(entry);
					return acc;
				},
				{} as Record<string, typeof startAndEndTime>,
			);

			// Process each day's entries into DayData format
			const dayData: DayData = {};

			for (const [dateKey, dayEntries] of Object.entries(entriesByDate)) {
				const startEntry = dayEntries.find((e) => e.type === "start");
				const endEntry = dayEntries.find((e) => e.type === "end");

				if (!startEntry?.startTime || !endEntry?.endTime) continue;

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

					if (!startEntry?.startTime || !endEntry?.endTime) return "Error";

					const dayTime = timeDifference(
						startEntry.startTime
							?.toLocaleTimeString("de-DE")
							.split(":")
							.slice(0, 2)
							.join(":"),
						endEntry.endTime
							?.toLocaleTimeString("de-DE")
							.split(":")
							.slice(0, 2)
							.join(":"),
					);

					return timeSubtraction(dayTime, unpaidBreaksTime);
				};

				// For this example, setting difference and kmDifference to 0
				// You might want to calculate these based on your business logic
				dayData[dateKey] = {
					startTime: startEntry.startTime,
					endTime: endEntry.endTime,
					totalWorkTime: totalWorkTime(),
					kmDifference: Number(endEntry.kmState) - Number(startEntry.kmState),
				};
			}

			console.log(dayData);
			return dayData;
		}),
});
