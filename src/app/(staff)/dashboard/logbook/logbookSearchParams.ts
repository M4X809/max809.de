import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
} from "nuqs/server";

export const logbookSearchParamsParser = {
	day: parseAsString
		.withDefault(new Date().toLocaleDateString("de-DE"))
		.withOptions({ clearOnDefault: true }),
};

export const logbookSearchParamsCache = createSearchParamsCache(
	logbookSearchParamsParser,
);
