import { CodeHighlight } from "@mantine/code-highlight";
import { Card, Container, Stack, Text, Title } from "@mantine/core";
import { onPageAllowed } from "~/lib/sUtils";
import { api } from "~/trpc/server";
import { BarChart } from "@mantine/charts";
import { DistanceChart, WorkHoursChart } from "./ClientStats";

export default async function LogbookStats() {
	await onPageAllowed("viewLogbookFeed");

	const [hoursData, distanceData] = await Promise.all([
		api.logbook.getWorkHourStats(),
		api.logbook.getDistanceStats(),
	]);

	return (
		<Container>
			<Stack gap={10}>
				<Title>Statistiken</Title>

				<Card className="rounded-md bg-[rgba(255,255,255,0.1)] backdrop-blur-md">
					<Stack gap={10}>
						<Text>Durchschnitliche Arbeitszeiten pro Tag der letzten 2 Monate </Text>
						<WorkHoursChart averageWorkHours={hoursData} />
					</Stack>
				</Card>

				<Card className="rounded-md bg-[rgba(255,255,255,0.1)] backdrop-blur-md">
					<Stack gap={10}>
						<Text>Durchschnitliche Strecke pro Tag der letzten 2 Monate </Text>
						<DistanceChart averageDistances={distanceData} />
					</Stack>
				</Card>
			</Stack>
		</Container>
	);
}
