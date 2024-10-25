import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
} from "nuqs/server";

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
