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
} from "date-fns";
import { de } from "date-fns/locale";

import { twMerge as cn } from "tailwind-merge";
import { Button } from "~/components/ui/button";

export type DayData = {
	[key: string]: {
		startTime: Date;
		endTime: Date;
		totalWorkTime: number;
		difference: number;
		kmDifference: number;
	};
};

interface CalendarProps {
	dayData?: DayData;
}

export function FullScreenCalendarComponent({ dayData }: CalendarProps) {
	const [currentMonth, setCurrentMonth] = React.useState(new Date());

	const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
	const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(monthStart);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

	return (
		<div className="flex flex-col rounded-lg bg-[rgba(255,255,255,0.1)] text-white backdrop-blur-lg">
			<header className="flex items-center justify-between border-b border-b-[rgba(255,255,255,0.1)] p-4">
				<h2 className="text-2xl font-bold">
					{format(currentMonth, "MMMM yyyy", { locale: de })}
				</h2>
				<div className="flex space-x-2">
					<Button onClick={prevMonth} className="bg-[rgba(255,255,255,0.1)]">
						<ChevronLeft className="h-4 w-4" />
						<span className="sr-only">Previous month</span>
					</Button>
					<Button onClick={nextMonth} className="bg-[rgba(255,255,255,0.1)]">
						<ChevronRight className="h-4 w-4" />
						<span className="sr-only">Next month</span>
					</Button>
				</div>
			</header>
			<div className="grid h-full flex-grow auto-rows-fr grid-cols-7 overflow-hidden">
				{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
					<div
						key={day}
						className="flex h-[100px] items-center justify-center border-b border-b-[rgba(255,255,255,0.1)] p-2 text-center font-semibold"
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
								"flex h-[100px] flex-col overflow-hidden border border-[rgba(255,255,255,0.1)] p-2",
								!isSameMonth(day, currentMonth) &&
									"bg-[rgba(0,0,0,0.35)] text-white/50 opacity-0",
								// isWeekend(day) &&
								// 	isSameMonth(day, currentMonth) &&
								// 	"bg-[rgba(0,0,0,0.15)]",
								// isFirstDayOfMonth(day) &&
								// 	isSameMonth(day, currentMonth) &&
								// 	"border-[rgba(255,255,255,0.3)]",
								(isMonday(day) || isWednesday(day) || isFriday(day)) &&
									isSameMonth(day, currentMonth) &&
									"bg-[rgba(255,255,255,0.05)]",
							)}
						>
							<time dateTime={format(day, "dd.MM.yyyy")} className="font-semibold">
								{format(day, "dd.MM.yy", { locale: de })}
							</time>
							{dayInfo && (
								<div className="mt-1 flex-grow overflow-y-auto text-xs">
									<div>
										{format(dayInfo.startTime, "HH:mm", { locale: de })}-
										{format(dayInfo.endTime, "HH:mm", { locale: de })}
									</div>
									<div>Total: {dayInfo.totalWorkTime.toFixed(1)}h</div>
									<div>
										Diff: {dayInfo.difference}€ | {dayInfo.kmDifference}km
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
