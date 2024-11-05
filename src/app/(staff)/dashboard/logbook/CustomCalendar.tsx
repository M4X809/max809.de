"use client";

import { Box, Paper } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useState } from "react";
import dayjs from "dayjs";

interface CalendarEvent {
	date: Date;
	content: React.ReactNode;
}

interface CustomCalendarProps {
	events?: CalendarEvent[];
	onDateClick?: (date: Date) => void;
}

export function CustomCalendar({
	events = [],
	onDateClick,
}: CustomCalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

	// Custom day render function
	const renderDay = (date: Date) => {
		const dayEvents = events.filter(
			(event) =>
				dayjs(event.date).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD"),
		);

		return (
			<Box onClick={() => onDateClick?.(date)}>
				<Box sx={{ fontSize: 14 }}>{date.getDate()}</Box>
				{dayEvents.map((event, index) => (
					<Box key={index}>{event.content}</Box>
				))}
			</Box>
		);
	};

	return (
		<Paper shadow="sm" p="md">
			<Calendar
				// value={selectedDate}
				// onChange={setSelectedDate}
				size="xl"
				// fullWidth
				styles={(theme) => ({
					calendarBase: {
						width: "100%",
					},
					month: {
						width: "100%",
					},
					cell: {
						width: "100%",
					},
				})}
				renderDay={renderDay}
			/>
		</Paper>
	);
}
