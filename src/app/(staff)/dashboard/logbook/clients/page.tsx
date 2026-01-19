import {
	Box,
	Card,
	Container,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Text,
	Title,
} from "@mantine/core";
import { parseAsString } from "nuqs/server";
import { createSearchParamsCache } from "nuqs/server";
import { Search } from "./Search";
import { api } from "~/trpc/server";
import { format, getYear } from "date-fns";
import React from "react";

export default async function LogbookClients({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const feedSearchParamsParser = {
		search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
	};

	const feedSearchParamsCache = createSearchParamsCache(feedSearchParamsParser, {
		urlKeys: {
			search: "s",
		},
	});
	const { search } = feedSearchParamsCache.parse(await searchParams);

	const streetNames = await api.logbook.getClients();

	const clientData = await api.logbook.getClientData(search);

	// console.log(clientData);

	const months = {
		"01": "Januar",
		"02": "Februar",
		"03": "März",
		"04": "April",
		"05": "Mai",
		"06": "Juni",
		"07": "Juli",
		"08": "August",
		"09": "September",
		"10": "Oktober",
		"11": "November",
		"12": "Dezember",
	};

	const monthData = Object.entries(months)
		.map(([key, value]) => {
			if (!clientData) return null;

			const entries = clientData.get(key);

			if (!entries) return null;

			return {
				month: value,
				monthKey: key,
				entries,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null)
		.sort((a, b) => {
			return Number.parseInt(a.monthKey) - Number.parseInt(b.monthKey);
		});

	return (
		<Container size={"lg"}>
			<Title order={2}>Kunden Übersicht für {getYear(new Date())}</Title>
			<Stack gap={5}>
				<Search streetNames={streetNames} initialValues={search} />
				{search && !monthData.length && (
					<Card className="rounded-lg bg-white/5 text-center">
						<Text>Keine Daten gefunden für {search}</Text>
					</Card>
				)}
				{!search && !monthData.length && (
					<Card className="rounded-lg bg-white/5 text-center">
						<Text>Bitte wähle einen Kunden aus</Text>
					</Card>
				)}
				{monthData?.map((month) => (
					<Card key={month?.month} className="rounded-lg bg-white/5 p-2">
						<Title order={3}>{month?.month}</Title>
						<Table className="">
							<TableThead>
								<TableTr>
									<TableTh>Datum</TableTh>
									<TableTh>Von/Bis</TableTh>

									<TableTh>Zeit</TableTh>
									<TableTh>Kunde</TableTh>
								</TableTr>
							</TableThead>
							<TableTbody>
								{month?.entries?.map((entry) => (
									<TableTr key={entry.id} className="text-xs md:text-base">
										{entry.date && <TableTd className="text-nowrap text-xs">{format(entry.date, "dd.MM.yy")}</TableTd>}
										{entry.startTime && entry.endTime ? (
											<TableTd className="text-center text-[10px]">
												<Text className="text-nowrap text-xs">Von: {format(entry.startTime, "HH:mm")}</Text>
												<Text className="text-nowrap text-xs">Bis: {format(entry.endTime, "HH:mm")}</Text>
											</TableTd>
										) : (
											"N/A"
										)}
										<TableTd className="text-nowrap text-xs">{entry.workTime} min</TableTd>
										<TableTd className="text-pretty">{entry.streetName}</TableTd>
									</TableTr>
								))}
							</TableTbody>
						</Table>
					</Card>
				))}
			</Stack>
		</Container>
	);
}
