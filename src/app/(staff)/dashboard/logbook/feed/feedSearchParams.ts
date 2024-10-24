import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsIsoDateTime,
	parseAsString,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const feedSearchParamsParser = {
	day: parseAsString
		.withDefault(new Date().toLocaleDateString("de-DE"))
		.withOptions({ clearOnDefault: true }),
	errorCount: parseAsInteger
		.withDefault(0)
		.withOptions({ clearOnDefault: true }),
};

export const feedSearchParamsCache = createSearchParamsCache(
	feedSearchParamsParser,
);
