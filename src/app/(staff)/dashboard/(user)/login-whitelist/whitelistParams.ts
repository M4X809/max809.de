import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const whitelistParser = {
	// List your search param keys and associated parsers here:
	search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
	limit: parseAsInteger.withDefault(10).withOptions({ clearOnDefault: true }),
};

export const whitelistParamsCache = createSearchParamsCache(whitelistParser);
