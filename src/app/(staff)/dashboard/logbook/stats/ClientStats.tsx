"use client";

import { BarChart } from "@mantine/charts";
import type { API } from "~/trpc/server";

export function WorkHoursChart({
	averageWorkHours,
}: {
	averageWorkHours: API<"logbook", "getWorkHourStats">;
}) {
	return (
		<BarChart
			h={300}
			dataKey="day"
			series={[
				{
					name: "averageWorkHours",
					label: "Arbeitszeit",
				},
			]}
			data={averageWorkHours}
			referenceLines={[
				{
					y: 8,
					color: "red.5",
					label: "Stunden Erwartet",
					labelPosition: "insideBottomRight",
				},
			]}
			withBarValueLabel
			valueFormatter={(value) => {
				const hours = Math.floor(value);
				const minutes = Math.round((value % 1) * 60);
				return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
			}}
			maxBarWidth={35}
			barChartProps={{ syncId: "average" }}
			// withTooltip={false}
		/>
	);
}

export function DistanceChart({
	averageDistances,
}: {
	averageDistances: API<"logbook", "getDistanceStats">;
}) {
	return (
		<BarChart
			h={300}
			dataKey="day"
			series={[
				{
					name: "averageDistance",
					label: "Durchschnittliche Strecke",
					color: "green",
				},
			]}
			data={averageDistances}
			maxBarWidth={35}
			barChartProps={{ syncId: "average" }}
			valueFormatter={(value) => {
				return `${value.toFixed(2)} km`;
			}}
			withBarValueLabel
			// withTooltip={false}
		/>
	);
}
