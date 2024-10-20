import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsIsoDateTime,
	parseAsString,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const feedSearchParamsCache = createSearchParamsCache({
	// List your search param keys and associated parsers here:
	day: parseAsIsoDateTime
		.withDefault(new Date())
		.withOptions({ clearOnDefault: true }),
});
