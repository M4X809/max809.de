import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsIsoDateTime,
	parseAsString,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "full" });

export const feedSearchParamsParser = {
	day: parseAsString
		.withDefault(new Date().toLocaleDateString())
		.withOptions({ clearOnDefault: true }),
};

export const feedSearchParamsCache = createSearchParamsCache(
	feedSearchParamsParser,
);
