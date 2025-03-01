import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
	hasPermission,
	timeAddition,
	timeDifference,
	timeSubtraction,
} from "~/lib/sUtils";
import { TRPCError } from "@trpc/server";
import { logbookFeed } from "~/server/db/schema";
import { asc, eq, or } from "drizzle-orm";
import { endOfMonth, format, startOfMonth } from "date-fns";
import type { DayData } from "~/app/(staff)/dashboard/logbook/full-screen-calendar";
import { de } from "date-fns/locale";
import jsPDF from "jspdf";
// import "jspdf-autotable";
import { env } from "~/env";
import autoTable, { type RowInput } from "jspdf-autotable";
import { PostHogClient } from "~/server/auth";

new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "full" });

export const logbookRouter = createTRPCRouter({
	createEntry: protectedProcedure
		.input(
			z.object({
				type: z
					.enum(["entry", "start", "end", "pause", "holiday", "vacation"])
					.default("entry"),
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

			const existingHoliday = await ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq, and, not }) =>
					and(
						eq(logbookFeed.date, input.date),
						or(eq(logbookFeed.type, "holiday"), eq(logbookFeed.type, "vacation")),
						not(eq(logbookFeed.deleted, true)),
					),
			});

			if (existingHoliday) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"An diesem Tag ist bereits ein Feiertag oder Urlaub eingetragen. Keine weiteren Einträge möglich.",
				});
			}

			if (input.type === "holiday" || input.type === "vacation") {
				const existingEntries = await ctx.db.query.logbookFeed.findFirst({
					where: (logbookFeed, { eq, and, not }) =>
						and(
							eq(logbookFeed.date, input.date),
							not(eq(logbookFeed.type, "holiday")),
							not(eq(logbookFeed.type, "vacation")),
							not(eq(logbookFeed.deleted, true)),
						),
				});

				if (existingEntries) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"Es existieren bereits Einträge für diesen Tag. Feiertag oder Urlaub kann nicht hinzugefügt werden.",
					});
				}
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

			const posthog = PostHogClient();

			if (input.type === "start" && startTime) {
				posthog.capture({
					distinctId: ctx.session.user.id,
					event: "logbook_entry_create_error",
					properties: {
						startTime,
					},
				});
				await posthog.shutdown();
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Startzeitpunkt pro Tag haben.",
				});
			}

			if (input.type === "end" && endTime) {
				posthog.capture({
					distinctId: ctx.session.user.id,
					event: "logbook_entry_create_error",
					properties: {
						endTime,
					},
				});
				await posthog.shutdown();
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
				type: z.enum(["entry", "start", "end", "pause", "holiday", "vacation"]),
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

			const getHoliday = await ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq, and, not, or }) =>
					and(
						eq(logbookFeed.date, input.date),
						eq(logbookFeed.type, input.type),
						not(eq(logbookFeed.deleted, true)),
					),
			});

			if (
				(input.type === "holiday" || input.type === "vacation") &&
				getHoliday &&
				getHoliday.id !== input.id
			) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "An diesem Tag ist bereits ein Feiertag oder Urlaub eingetragen.",
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
				const posthog = PostHogClient();
				posthog.capture({
					distinctId: ctx.session.user.id,
					event: "logbook_entry_update_error",
					properties: {
						startTime,
						entry,
					},
				});

				await posthog.shutdown();
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Du kannst maximal einen Startzeitpunkt pro Tag haben.",
				});
			}

			if (input.type === "end" && endTime?.id !== entry.id && endTime) {
				const posthog = PostHogClient();

				posthog.capture({
					distinctId: ctx.session.user.id,
					event: "logbook_entry_update_error",
					properties: {
						endTime,
						entry,
					},
				});

				await posthog.shutdown();
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

			const holidayProm = ctx.db.query.logbookFeed.findFirst({
				where: (logbookFeed, { eq, between, and, not, or }) =>
					and(
						between(logbookFeed.date, startDate, endDate),
						or(eq(logbookFeed.type, "holiday"), eq(logbookFeed.type, "vacation")),
						not(eq(logbookFeed.deleted, true)),
					),
			});

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

			const [
				startAndEndTime,
				unpaidBreaks,
				previousStreetNames,
				entries,
				holiday,
			] = await Promise.all([
				startAndEndTimeProm,
				unpaidBreaksProm,
				previousStreetNamesProm,
				entriesProm,
				holidayProm,
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
				holiday,
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

			// console.log("monthStart", monthStart);
			// console.log("monthEnd", monthEnd);

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

			const holidaysProm = ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, not, or }) =>
					and(
						between(logbookFeed.date, monthStart, monthEnd),
						or(eq(logbookFeed.type, "holiday"), eq(logbookFeed.type, "vacation")),
						not(eq(logbookFeed.deleted, true)),
					),
			});

			const [startAndEndTime, unpaidBreaks, holidays] = await Promise.all([
				startAndEndTimeProm,
				unpaidBreaksProm,
				holidaysProm,
			]);

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

			// First, add holidays and vacations to dayData
			for (const holiday of holidays) {
				if (!holiday.date) continue;
				const dateKey = format(holiday.date, "dd.MM.yyyy", { locale: de });
				dayData[dateKey] = {
					holiday: true,
					type: holiday.type as "holiday" | "vacation",
				};
			}

			// Then process work entries
			for (const [dateKey, dayEntries] of Object.entries(entriesByDate)) {
				// Skip if it's already marked as a holiday
				if (dayData[dateKey]?.holiday) continue;

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

				dayData[dateKey] = {
					holiday: false,
					startTime: startEntry.startTime,
					endTime: endEntry.endTime,
					totalWorkTime: totalWorkTime(),
					kmDifference: Number(endEntry.kmState) - Number(startEntry.kmState),
					type: startEntry.type as "entry" | "start" | "end" | "pause",
				};
			}

			console.log(dayData);
			return dayData;
		}),
	generatePdf: protectedProcedure
		.input(
			z.object({
				date: z.string().regex(/^\d{1,2}[./]\d{1,2}[./]\d{4}$/),
				companyName: z.string().optional(),
				employeeName: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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

			// Fetch all entries for the month
			const entries = await ctx.db.query.logbookFeed.findMany({
				where: (logbookFeed, { eq, between, and, not }) =>
					and(
						between(logbookFeed.date, monthStart, monthEnd),
						not(eq(logbookFeed.deleted, true)),
					),
				orderBy: [asc(logbookFeed.date), asc(logbookFeed.type)],
			});

			// Create PDF document
			const doc = new jsPDF();

			// Add header
			// doc.setFontSize(20);
			// doc.text("Fahrtenbuch", 105, 20, { align: "center" });

			doc.setFontSize(10);

			doc.text("Arbeitszeiterfassung Hauswirtschaftshilfe", 15, 10, {
				align: "left",
				baseline: "top",
			});

			// Add name text
			const name = `${input.employeeName ?? env.EMPLOYEE_NAME}`;
			const fontSize = 10;
			doc.setFontSize(fontSize);
			const nameText = "Name: ";

			// Get text width for underlining
			const textWidth = doc.getTextWidth(name);
			const nameTextWidth = doc.getTextWidth(nameText);

			// Add text
			doc.text(`Name: ${name}`, doc.internal.pageSize.width / 2, 10, {
				align: "center",
				baseline: "top",
			});

			// Add underline
			const xStart =
				(doc.internal.pageSize.width - textWidth) / 2 + nameTextWidth / 2;
			const xEnd = xStart + textWidth;
			doc.line(xStart, 14, xEnd, 14);

			const date = format(currentMonth, "MM / yyyy", { locale: de });

			doc.text(`Monat/Jahr: ${date}`, doc.internal.pageSize.width - 16, 10, {
				align: "right",
				baseline: "top",
			});

			// Add underline to date
			const dateValue = date;
			const dateText = "Monat/Jahr: ";
			const dateTextWidth = doc.getTextWidth(dateText);
			const dateValueWidth = doc.getTextWidth(dateValue);

			doc.text(`${dateText}${dateValue}`, doc.internal.pageSize.width - 16, 10, {
				align: "right",
				baseline: "top",
			});

			// Add underline to date value
			const dateXStart = doc.internal.pageSize.width - 16 - dateValueWidth;
			const dateXEnd = doc.internal.pageSize.width - 16;
			doc.line(dateXStart, 14, dateXEnd, 14);

			// Group entries by date
			const entriesByDate = entries.reduce(
				(acc, entry) => {
					const dateKey = entry.date?.toLocaleDateString("de-DE") ?? "";
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(entry);
					return acc;
				},
				{} as Record<string, typeof entries>,
			);

			// Prepare table data
			const tableData = Array.from({ length: 31 }, (_, index) => {
				const currentDate = new Date(year!, month! - 1, index + 1);

				// Skip if date is invalid (e.g., February 31st)
				if (currentDate.getMonth() !== month! - 1) return null;

				const dateKey = currentDate.toLocaleDateString("de-DE");
				const dayEntries = entriesByDate[dateKey] ?? [];

				// Check for holiday or vacation entry
				const specialEntry = dayEntries.find(
					(e) => e.type === "holiday" || e.type === "vacation",
				);
				if (specialEntry) {
					return [
						index + 1,
						`${specialEntry.type === "holiday" ? "Feiertag" : "Urlaub"}`,
						"",
						"---",
					];
				}

				const startEntry = dayEntries.find((e) => e.type === "start");
				const endEntry = dayEntries.find((e) => e.type === "end");

				// Check if it's a weekend
				const dayOfWeek = currentDate.getDay();
				if (dayOfWeek === 0 || dayOfWeek === 6) {
					const weekDayName = format(currentDate, "EEEE", { locale: de });
					return [`${index + 1}.`, weekDayName, "", "---"];
				}

				// Format work entries inline
				const workEntries = dayEntries
					.filter((e) => e.type === "entry")
					.sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime())
					.map(
						(e) =>
							`${e.streetName}/${timeDifference(
								e.startTime?.toLocaleTimeString("de-DE") ?? "",
								e.endTime?.toLocaleTimeString("de-DE") ?? "",
							)}`,
					);

				// Create work time string
				const workTime =
					startEntry && endEntry
						? `${startEntry.startTime?.toLocaleTimeString("de-DE").slice(0, 5)}-${endEntry.endTime?.toLocaleTimeString("de-DE").slice(0, 5)}`
						: startEntry
							? `Arbeitsbeginn: ${startEntry.startTime?.toLocaleTimeString("de-DE").slice(0, 5)}`
							: "";

				// Format work entries with line breaks
				const formattedEntries = workEntries
					.map((entry, index) => {
						// if (index > 0 && index % 3 === 0) {
						// 	return `\n${" ".padStart("07:45-15:45".length, " ")}| ${entry}`;
						// }
						return entry;
					})
					.join(" | ");

				const workTimeString = (text: string) => {
					const t = text.toString();
					const w = 75;
					if (t.length > w) {
						// console.log(chalk.yellow(index + 1));
						const lines = new Map<number, string[]>();
						let currentLine = 0;
						const elements = t.split(" | ").filter(Boolean);

						for (const element of elements) {
							const currentLineElements = lines.get(currentLine) ?? [];
							const potentialLine = [...currentLineElements, element].join(" | ");

							if (potentialLine.length > w) {
								currentLine++;
								lines.set(currentLine, [element]);
							} else {
								lines.set(currentLine, [...currentLineElements, element]);
							}
						}

						// Convert Map to array of joined lines
						const result = Array.from(lines.values())
							.map((line) => line.join(" | "))
							.join("\n");
						// console.log("result", chalk.green(result));
						// console.log("lines", chalk.red(lines.size));
						return result;
					}
					// console.log(chalk.red(t));

					return text;
				};

				const kmDiff =
					endEntry && startEntry
						? Number(endEntry.kmState) - Number(startEntry.kmState)
						: "";

				return [
					`${index + 1}.`,
					workTime,
					workTimeString(formattedEntries),
					kmDiff.toString(),
				];
			}).filter(Boolean); // Remove null entries for invalid dates

			// console.log("tableData", tableData);
			// Add table
			autoTable(doc, {
				head: [["Tag", "Arbeitszeit", "Tätigkeiten", "KM"]],
				body: tableData as RowInput[],
				startY: 20,
				styles: {
					fontSize: 10,
					cellPadding: 1,
					minCellHeight: 5,
				},
				columnStyles: {
					0: {
						// Tag column
						cellWidth: 15,
						halign: "center",
						valign: "middle",
					},
					1: {
						// Arbeitszeiten column
						cellWidth: 30,
						halign: "center",
						valign: "middle",
					},
					2: {
						// Tätigkeiten column
						cellWidth: 125,
						halign: "left",

						// overflow: "linebreak",
					},
					3: {
						// KM column
						cellWidth: 12 - 0.2206666667,
						halign: "center",
						valign: "middle",
					},
				},
				// Add didParseCell hook to customize cell styles
				didParseCell: (data) => {
					if (data.section === "body") {
						const rowContent = data.row.cells[1]?.text[0];
						if (rowContent === "Urlaub") {
							if (data.row.index % 2 === 1) {
								// Apply alternate row color only for non-special rows
								data.cell.styles.fillColor = [245, 245, 130];
							} else {
								data.cell.styles.fillColor = [255, 255, 150]; // Light yellow
							}
						} else if (rowContent === "Feiertag") {
							if (data.row.index % 2 === 1) {
								data.cell.styles.fillColor = [255, 180, 125];
							} else {
								data.cell.styles.fillColor = [255, 200, 140]; // Light orange
							}
						}
					}
				},
				headStyles: {
					halign: "center",
					fillColor: 255,
					textColor: 0,
					fontStyle: "normal",
					lineWidth: 0.1,
				},
				bodyStyles: {
					lineWidth: 0.2,
				},

				alternateRowStyles: {
					fillColor: [200, 200, 200],
				},
				theme: "grid",
				tableLineColor: 0,
				tableLineWidth: 0.2,
			});

			// After autoTable
			const tableHeight = (doc as any).lastAutoTable.finalY;
			const pageWidth = doc.internal.pageSize.width;
			const margin = 15;

			// Calculate totals
			const calculateTotals = (entries: typeof tableData) => {
				let totalMinutes = 0;
				let totalKm = 0;

				for (const entry of entries) {
					if (!entry) continue;

					// Calculate total KM
					const kmValue = Number(entry[3]);
					if (Number.isNaN(kmValue)) continue;
					totalKm += kmValue;

					// Calculate total hours
					const workTimeStr = entry[1];
					if (typeof workTimeStr === "string" && workTimeStr.includes("-")) {
						// Extract time range (e.g., "08:00 - 16:30")
						const timeMatch = workTimeStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
						if (timeMatch) {
							const [_, startTime, endTime] = timeMatch;

							// Calculate work duration
							const workDuration = timeDifference(startTime!, endTime!);
							const [hours, minutes] = workDuration.split(":").map(Number);
							totalMinutes += hours! * 60 + minutes!;
						}
					}
				}

				// Convert total minutes to hours:minutes format
				const hours = Math.floor(totalMinutes / 60);
				const minutes = totalMinutes % 60;
				const totalHours = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

				return {
					totalHours,
					totalKm: totalKm.toString(),
				};
			};

			const { totalHours, totalKm } = calculateTotals(tableData);

			// Add totals section
			const y = tableHeight + 10;
			const totalSection = (text: string, value: string, x: number) => {
				const textWidth = doc.getTextWidth(text);

				doc.text(text, x, y);
				doc.text(value, x + textWidth, y);
				// doc.line(x + textWidth, y + 3, x + textWidth + valueWidth, y + 3);
			};

			// Position totals side by side with left alignment
			const tableStartX = margin; // 15
			const spaceBetweenTotals = 80; // Space between the two totals
			totalSection("Gesamtstunden: ", `${totalHours} Stunden`, tableStartX);
			totalSection(
				"Gesamtkilometer: ",
				`${totalKm} km`,
				tableStartX + spaceBetweenTotals,
			);

			// Add footer with evenly spaced items
			const footerY = doc.internal.pageSize.height - 25;
			const footerSection = (text: string, x: number) => {
				doc.text(text, x, footerY);
			};

			// const spacing = (pageWidth - 2 * margin) / 3;
			// footerSection("Stunden/Sonntage:____________", margin);
			// footerSection("Stunden/Feiertage:____________", margin + spacing);
			footerSection("Datum + Unterschrift: __________________", margin);

			return doc.output("blob");
		}),
});
