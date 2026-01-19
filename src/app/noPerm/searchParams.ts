import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
	t: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
	callbackUrl: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
});
