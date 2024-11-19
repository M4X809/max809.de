"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	isMonday,
	isWednesday,
	isFriday,
	isToday,
} from "date-fns";
import { de } from "date-fns/locale";

import { twMerge as cn } from "tailwind-merge";
import { Button } from "~/components/ui/button";
import { Box, Group, LoadingOverlay, Text } from "@mantine/core";
import { useQueryState } from "nuqs";
import { logbookSearchParamsParser } from "./logbookSearchParams";
import { useDidUpdate, useMediaQuery, useOs } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/pro-duotone-svg-icons";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export type DayData = {
	[key: string]:
		| {
				holiday: true;
				type: "holiday";
		  }
		| {
				holiday?: false;
				startTime: Date;
				endTime: Date;
				totalWorkTime: string;
				kmDifference: number;
				type: "entry" | "start" | "end" | "pause";
		  };
};

interface CalendarProps {
	dayData?: DayData;
	currentMonth?: Date;
	baseUrl: string;
}

export function FullScreenCalendarComponent({
	dayData,
	currentMonth: initialCurrentMonth,
	baseUrl,
}: CalendarProps) {
	const [currentMonth, setCurrentMonth] = React.useState(
		initialCurrentMonth ?? new Date(),
	);

	const router = useRouter();
	const os = useOs();
	const matches = useMediaQuery("(min-width: 56.25em)");

	console.log("matches", matches);

	const isMobile = (os === "ios" || os === "android") && !matches;

	const prevMonth = () => {
		setIsLoading(true);
		setCurrentMonth(addMonths(currentMonth, -1));
	};
	const nextMonth = () => {
		setIsLoading(true);
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(monthStart);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
	const [day, setDay] = useQueryState("day", logbookSearchParamsParser.day);

	const [isLoading, setIsLoading] = React.useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setDay(format(currentMonth, "dd.MM.yyyy"));
		setTimeout(() => {
			setIsLoading(true);
			router.refresh();
		}, 100);
	}, [currentMonth]);

	useDidUpdate(() => {
		setIsLoading(false);
	}, [dayData]);

	if (os === "undetermined") return null;

	return (
		<Box pos={"relative"}>
			<LoadingOverlay
				visible={isLoading && os !== "android" && os !== "ios"}
				overlayProps={{ blur: 2, bg: "rgba(0,0,0,0.5)", className: "rounded-lg" }}
			/>
			<Box>
				{isMobile && (
					<Link
						className="h-50 inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
						href={`${baseUrl}/dashboard/logbook/api?day=${day}`}
						download={`Arbeitszeiterfassung_${format(currentMonth, "MMMM_yyyy", { locale: de })}.pdf`}
						target="_blank"
					>
						<Group>
							<FontAwesomeIcon icon={faPrint} />
							Download PDF {format(currentMonth, "MMMM yyyy", { locale: de })}
						</Group>
					</Link>
				)}
				{!isMobile && (
					<div className="flex flex-col rounded-lg bg-[rgba(255,255,255,0.1)] text-white backdrop-blur-lg">
						<header className="flex items-center justify-between border-b border-b-[rgba(255,255,255,0.1)] p-4">
							<h2 className="text-2xl font-bold">
								{format(currentMonth, "MMMM yyyy", { locale: de })}
							</h2>
							<div className="flex space-x-2">
								<Link
									className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
									href={`${baseUrl}/dashboard/logbook/api?day=${day}`}
									download={`Arbeitszeiterfassung_${format(currentMonth, "MMMM_yyyy", { locale: de })}.pdf`}
									target="_blank"
								>
									<FontAwesomeIcon icon={faPrint} />
								</Link>
								<Button
									onClick={prevMonth}
									className="bg-[rgba(255,255,255,0.1)] hover:bg-white/15"
								>
									<ChevronLeft className="h-4 w-4" />
									<span className="sr-only">Previous month</span>
								</Button>
								<Button
									onClick={nextMonth}
									className="bg-[rgba(255,255,255,0.1)] hover:bg-white/15"
								>
									<ChevronRight className="h-4 w-4" />
									<span className="sr-only">Next month</span>
								</Button>
							</div>
						</header>
						<div className="grid h-full flex-grow grid-cols-7 overflow-hidden">
							{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
								<div
									key={day}
									className="flex h-[50px] items-center justify-center border-b border-b-[rgba(255,255,255,0.1)] p-2 text-center font-semibold"
								>
									{day}
								</div>
							))}
							{days.map((day, dayIdx) => {
								const dateKey = format(day, "dd.MM.yyyy", { locale: de });
								const dayInfo = dayData?.[dateKey];
								return (
									<div
										key={day.toString()}
										className={cn(
											"flex h-[120px] flex-col overflow-hidden border border-[rgba(255,255,255,0.1)] p-2",
											!isSameMonth(day, currentMonth) &&
												"bg-[rgba(0,0,0,0.35)] text-white/50 opacity-0",
											(isMonday(day) || isWednesday(day) || isFriday(day)) &&
												isSameMonth(day, currentMonth) &&
												"bg-[rgba(255,255,255,0.05)]",
											isToday(day) && "rounded-sm border-2 border-white/50",
										)}
									>
										<time dateTime={format(day, "dd.MM.yyyy")} className="font-semibold">
											{format(day, "dd.MM.yy", { locale: de })}
										</time>
										{dayInfo?.type === "holiday" ? (
											<div className="mt-1 flex-grow overflow-hidden text-xs">
												<Text fz={14} fw={500}>
													Feiertag
												</Text>
											</div>
										) : (
											dayInfo && (
												<div className="mt-1 flex-grow overflow-hidden text-xs">
													<Text fz={14}>
														{format(dayInfo.startTime, "HH:mm", { locale: de })}-
														{format(dayInfo.endTime, "HH:mm", { locale: de })}
													</Text>
													<Text fz={14}>Total: {dayInfo.totalWorkTime}</Text>
													<Text fz={14}>Tageskilometer: {dayInfo.kmDifference}km</Text>
												</div>
											)
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</Box>
		</Box>
	);
}
