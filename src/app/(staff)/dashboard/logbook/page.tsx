import { Container } from "@mantine/core";
import { DayData, FullScreenCalendarComponent } from "~/app/(staff)/dashboard/logbook/full-screen-calendar";
import { getDomain, onPageAllowed } from "~/lib/sUtils";
import { api } from "~/trpc/server";
import { logbookSearchParamsParser } from "./logbookSearchParams";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export default async function LogbookDashboard({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	await onPageAllowed("viewLogbook");
	const logbookSearchParamsCache = createSearchParamsCache({
		day: parseAsString.withDefault(new Date().toLocaleDateString("de-DE")).withOptions({ clearOnDefault: true }),
	});
	const { day } = logbookSearchParamsCache.parse(await searchParams);
	const [day2, month, year] = day.split(".").map(Number);

	const data = await api.logbook.getMonthlyData({ date: day });

	return (
		<Container size="xl">
			<FullScreenCalendarComponent dayData={data} currentMonth={new Date(year!, month! - 1, day2)} baseUrl={getDomain()} />
		</Container>
	);
}
