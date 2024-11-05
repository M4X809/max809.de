import {
	DayData,
	FullScreenCalendarComponent,
} from "~/components/full-screen-calendar";
import { onPageAllowed } from "~/lib/sUtils";

export default async function LogbookDashboard() {
	await onPageAllowed("viewLogbook");
	const exampleData: DayData = {
		"05.11.2024": {
			startTime: new Date(2024, 10, 5, 9, 0),
			endTime: new Date(2024, 10, 5, 17, 30),
			totalWorkTime: 8.5,
			difference: 150,
			kmDifference: 30,
		},
		"22.11.2024": {
			startTime: new Date(2024, 10, 6, 8, 30),
			endTime: new Date(2024, 10, 6, 16, 0),
			totalWorkTime: 7.5,
			difference: 120,
			kmDifference: 25,
		},
	};

	return <FullScreenCalendarComponent dayData={exampleData} />;
}
