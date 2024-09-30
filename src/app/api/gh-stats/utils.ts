// @ts-check
import axios, { type AxiosRequestConfig } from "axios";
// @ts-ignore
import toEmoji from "emoji-name-map";
import wrap from "word-wrap";
import { themes } from "./_themes";
import { env } from "~/env";
import type { Fetcher, GHResponse } from "./_types";
import { unstable_cache } from "next/cache";

const PATs = Object.keys(env).filter((key) => /PAT_\d*$/.exec(key)).length;
const RETRIES = process.env.NODE_ENV === "test" ? 7 : PATs;

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 */
const retryer = async (
	fetcher: (
		variables: Record<string, string>,
		token: string | undefined,
		retries?: number,
	) => Promise<Fetcher>,
	variables: Record<string, string>,
	retries = 0,
): Promise<Fetcher> => {
	if (!RETRIES) {
		throw new Error("No GitHub API tokens found");
	}
	if (retries > RETRIES) {
		throw new Error("Downtime due to GitHub API rate limiting");
	}
	try {
		// try to fetch with the first token since RETRIES is 0 index i'm adding +1
		const { res: response, req } = await fetcher(
			variables,
			process.env[`PAT_${retries + 1}`],
			retries,
		);
		// prettier-ignore
		const headers = Array.from(req.headers.entries()).reduce<{ [key: string]: string }>((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {})

		console.log(
			"response",
			Object.entries(headers)
				.filter(([key]) => key.startsWith("x-"))
				.reduce<{ [key: string]: string }>((acc, [key, value]) => {
					acc[key] = value;
					return acc;
				}, {}),
		);

		// prettier-ignore
		const isRateExceeded = response.data.errors && response.data.errors[0]?.type === "RATE_LIMITED";

		// if rate limit is hit increase the RETRIES and recursively call the retryer
		// with username, and current RETRIES
		if (isRateExceeded) {
			logger.log(`PAT_${retries + 1} Failed`);
			retries++;
			// directly return from the function
			return retryer(fetcher, variables, retries);
		}

		// finally return the response
		return {
			res: response,
			req: req,
		};
	} catch (err: any) {
		console.log("err", err);
		// prettier-ignore
		// also checking for bad credentials if any tokens gets invalidated
		const isBadCredential = err.response.data && err.response.data.message === "Bad credentials";
		const isAccountSuspended =
			err.response.data &&
			err.response.data.message === "Sorry. Your account was suspended.";

		if (isBadCredential || isAccountSuspended) {
			logger.log(`PAT_${retries + 1} Failed`);
			retries++;
			// directly return from the function
			return retryer(fetcher, variables, retries);
		}
		return err.response;
	}
};

const TRY_AGAIN_LATER = "Please try again later";

const SECONDARY_ERROR_MESSAGES = {
	MAX_RETRY:
		"You can deploy own instance or wait until public will be no longer limited",
	NO_TOKENS:
		"Please add an env variable called PAT_1 with your GitHub API token in vercel",
	USER_NOT_FOUND: "Make sure the provided username is not an organization",
	GRAPHQL_ERROR: TRY_AGAIN_LATER,
	GITHUB_REST_API_ERROR: TRY_AGAIN_LATER,
	WAKATIME_USER_NOT_FOUND: "Make sure you have a public WakaTime profile",
};

/**
 * Custom error class to handle custom GRS errors.
 */
class CustomError extends Error {
	public type?: string;
	public secondaryMessage?: string;

	/**
	 * @param {string} message Error message.
	 * @param {string} type Error type.
	 */
	constructor(
		message: string | undefined,
		type?: keyof typeof SECONDARY_ERROR_MESSAGES | undefined,
	) {
		super(message || "");
		this.type = type;
		this.secondaryMessage =
			(!!SECONDARY_ERROR_MESSAGES && !!type && SECONDARY_ERROR_MESSAGES[type]) ||
			type;
	}

	static MAX_RETRY = "MAX_RETRY" as keyof typeof SECONDARY_ERROR_MESSAGES;
	static NO_TOKENS = "NO_TOKENS" as keyof typeof SECONDARY_ERROR_MESSAGES;
	static USER_NOT_FOUND =
		"USER_NOT_FOUND" as keyof typeof SECONDARY_ERROR_MESSAGES;
	static GRAPHQL_ERROR =
		"GRAPHQL_ERROR" as keyof typeof SECONDARY_ERROR_MESSAGES;
	static GITHUB_REST_API_ERROR =
		"GITHUB_REST_API_ERROR" as keyof typeof SECONDARY_ERROR_MESSAGES;
	static WAKATIME_ERROR =
		"WAKATIME_ERROR" as keyof typeof SECONDARY_ERROR_MESSAGES;
}

interface FlexLayoutProps {
	items: string[];
	gap: number;
	direction?: "column" | "row";
	sizes?: number[];
}

/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 */
const flexLayout = ({
	items,
	gap,
	direction,
	sizes = [],
}: FlexLayoutProps): string[] => {
	let lastSize = 0;
	// filter() for filtering out empty strings
	return items.filter(Boolean).map((item, i) => {
		const size = sizes[i] || 0;
		let transform = `translate(${lastSize}, 0)`;
		if (direction === "column") {
			transform = `translate(0, ${lastSize})`;
		}
		lastSize += size + gap;
		return `<g transform="${transform}">${item}</g>`;
	});
};

/**
 * Creates a node to display the primary programming language of the repository/gist.
 *
 * @param {string} langName Language name.
 * @param {string} langColor Language color.
 * @returns {string} Language display SVG object.
 */
const createLanguageNode = (langName: string, langColor: string): string => {
	return `
    <g data-testid="primary-lang">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${langName}</text>
    </g>
    `;
};

/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 *
 * @param {string} icon The icon to display.
 * @param {number|string} label The label to display.
 * @param {string} testid The testid to assign to the label.
 * @param {number} iconSize The size of the icon.
 * @returns {string} Icon with label SVG object.
 */
const iconWithLabel = (
	icon: string,
	label: number | string,
	testid: string,
	iconSize: number,
): string => {
	if (typeof label === "number" && label <= 0) {
		return "";
	}
	const iconSvg = `
      <svg
        class="icon"
        y="-12"
        viewBox="0 0 16 16"
        version="1.1"
        width="${iconSize}"
        height="${iconSize}"
      >
        ${icon}
      </svg>
    `;
	const text = `<text data-testid="${testid}" class="gray">${label}</text>`;
	return flexLayout({ items: [iconSvg, text], gap: 20 }).join("");
};

/**
 * Retrieves num with suffix k(thousands) precise to 1 decimal if greater than 999.
 *
 * @param {number} num The number to format.
 * @returns {string|number} The formatted number.
 */
const kFormatter = (num: number): string | number => {
	return Math.abs(num) > 999
		? `${Math.sign(num) * Number.parseFloat((Math.abs(num) / 1000).toFixed(1))}k`
		: Math.sign(num) * Math.abs(num);
};

/**
 * Checks if a string is a valid hex color.
 *
 * @param {string} hexColor String to check.
 * @returns {boolean} True if the given string is a valid hex color.
 */
const isValidHexColor = (hexColor: string): boolean => {
	return new RegExp(
		/^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/,
	).test(hexColor);
};

/**
 * Returns boolean if value is either "true" or "false" else the value as it is.
 *
 * @param {string | boolean} value The value to parse.
 * @returns {boolean | undefined } The parsed value.
 */
const parseBoolean = (value: string | boolean): boolean | undefined => {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		if (value.toLowerCase() === "true") {
			return true;
		}
		if (value.toLowerCase() === "false") {
			return false;
		}
	}
	return undefined;
};

/**
 * Parse string to array of strings.
 *
 * @param {string} str The string to parse.
 * @returns {string[]} The array of strings.
 */
const parseArray = (str: string): string[] => {
	if (!str) {
		return [];
	}
	return str.split(",");
};

/**
 * Clamp the given number between the given range.
 *
 * @param {number} number The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
const clampValue = (number: number, min: number, max: number): number => {
	if (Number.isNaN(Number.parseInt(number.toString(), 10))) {
		return min;
	}
	return Math.max(min, Math.min(number, max));
};

/**
 * Check if the given string is a valid gradient.
 *
 * @param {string[]} colors Array of colors.
 * @returns {boolean} True if the given string is a valid gradient.
 */
const isValidGradient = (colors: string[]): boolean => {
	return (
		colors.length > 2 && colors.slice(1).every((color) => isValidHexColor(color))
	);
};

/**
 * Retrieves a gradient if color has more than one valid hex codes else a single color.
 *
 * @param {string} color The color to parse.
 * @param {string | string[]} fallbackColor The fallback color.
 * @returns {string | string[]} The gradient or color.
 */
const fallbackColor = (
	color: string,
	fallbackColor: string | string[],
): string | string[] => {
	let gradient: string[] | null = null;

	const colors = color ? color.split(",") : [];
	if (colors.length > 1 && isValidGradient(colors)) {
		gradient = colors;
	}

	return (
		(gradient ? gradient : isValidHexColor(color) && `#${color}`) || fallbackColor
	);
};
/**
 * Send GraphQL request to GitHub API.
 *

 */

export const revalidate = 60;
export const dynamic = "force-dynamic";

const request = async (
	data: any,
	headers: Record<string, string>,
): Promise<Fetcher> => {
	return fetch("https://api.github.com/graphql", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			...headers,
		},
		cache: "no-store",
	}).then(async (_res) => {
		const res = (await _res.json()) as GHResponse;
		console.log("GH Request", JSON.stringify(res));
		return {
			res: res,
			req: _res,
		} as Fetcher;
	});
};

// const request = unstable_cache(
// 	async (data, headers) => _request(data, headers),
// 	["gh-stats"],
// 	{ revalidate: 60, tags: ["gh-stats"] },
// );

/**
 * Object containing card colors.
 */
interface CardColors {
	titleColor: string;
	iconColor: string;
	textColor: string;
	bgColor: string | string[];
	borderColor: string;
	ringColor: string;
}
/**
 * Returns theme based colors with proper overrides and defaults.
 *
 * @param {Object} args Function arguments.
 * @param {string=} args.title_color Card title color.
 * @param {string=} args.text_color Card text color.
 * @param {string=} args.icon_color Card icon color.
 * @param {string=} args.bg_color Card background color.
 * @param {string=} args.border_color Card border color.
 * @param {string=} args.ring_color Card ring color.
 * @param {string=} args.theme Card theme.
 * @param {string=} args.fallbackTheme Fallback theme.
 * @returns {CardColors} Card colors.
 */
const getCardColors = ({
	title_color,
	text_color,
	icon_color,
	bg_color,
	border_color,
	ring_color,
	theme,
	fallbackTheme = "default",
}: {
	title_color?: string | undefined;
	text_color?: string | undefined;
	icon_color?: string | undefined;
	bg_color?: string | undefined;
	border_color?: string | undefined;
	ring_color?: string | undefined;
	theme?: string | undefined;
	fallbackTheme?: string | undefined;
}): CardColors => {
	// @ts-ignore
	const defaultTheme = themes[fallbackTheme];
	// @ts-ignore
	const selectedTheme = themes[theme] || defaultTheme;
	const defaultBorderColor =
		selectedTheme.border_color || defaultTheme.border_color;

	const titleColor = fallbackColor(
		title_color || selectedTheme.title_color,
		`#${defaultTheme.title_color}`,
	);

	const ringColor = fallbackColor(
		ring_color || selectedTheme.ring_color,
		titleColor,
	);
	const iconColor = fallbackColor(
		icon_color || selectedTheme.icon_color,
		`#${defaultTheme.icon_color}`,
	);
	const textColor = fallbackColor(
		text_color || selectedTheme.text_color,
		`#${defaultTheme.text_color}`,
	);
	const bgColor = fallbackColor(
		bg_color || selectedTheme.bg_color,
		`#${defaultTheme.bg_color}`,
	);

	const borderColor = fallbackColor(
		border_color || defaultBorderColor,
		`#${defaultBorderColor}`,
	);

	if (
		typeof titleColor !== "string" ||
		typeof textColor !== "string" ||
		typeof ringColor !== "string" ||
		typeof iconColor !== "string" ||
		typeof borderColor !== "string"
	) {
		throw new Error(
			"Unexpected behavior, all colors except background should be string.",
		);
	}

	return { titleColor, iconColor, textColor, bgColor, borderColor, ringColor };
};

// Script parameters.
const ERROR_CARD_LENGTH = 576.5;

/**
 * Encode string as HTML.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 *
 * @param {string} str String to encode.
 * @returns {string} Encoded string.
 */
const encodeHTML = (str: string): string => {
	return (
		str
			.replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
				return `&#${i.charCodeAt(0)};`;
			})
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			.replace(/\u0008/gim, "")
	);
};

const UPSTREAM_API_ERRORS = [
	TRY_AGAIN_LATER,
	SECONDARY_ERROR_MESSAGES.MAX_RETRY,
];

/**
 * Renders error message on the card.
 *
 * @param {string} message Main error message.
 * @param {string} secondaryMessage The secondary error message.
 * @param {object} options Function options.
 * @returns {string} The SVG markup.
 */
const renderError = (
	message: string,
	secondaryMessage = "",
	options: {
		title_color?: string;
		text_color?: string;
		bg_color?: string;
		border_color?: string;
		theme?: string;
	} = {},
): string => {
	const {
		title_color,
		text_color,
		bg_color,
		border_color,
		theme = "github_dark",
	} = options;

	const { titleColor, textColor, bgColor, borderColor } = getCardColors({
		title_color,
		text_color,
		icon_color: "",
		bg_color,
		border_color,
		ring_color: "",
		theme: theme ?? "github_dark",
	});

	return `
      <svg width="${ERROR_CARD_LENGTH}"  height="120" viewBox="0 0 ${ERROR_CARD_LENGTH} 120" fill="${bgColor}" xmlns="http://www.w3.org/2000/svg">
      <style>
      .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor} }
      .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
      .gray { fill: #858585 }
      </style>
      <rect x="0.5" y="0.5" width="${
							ERROR_CARD_LENGTH - 1
						}" height="99%" rx="4.5" fill="${bgColor}" stroke="${borderColor}"/>
      <text x="25" y="45" class="text">Something went wrong!</text>
      <text data-testid="message" x="25" y="55" class="text small">
        <tspan x="25" dy="18">${encodeHTML(message)}</tspan>
        <tspan x="25" dy="18" class="gray">${secondaryMessage}</tspan>
      </text>
      </svg>
    `;
};

const wrapTextMultiline = (
	text: string | undefined,
	width = 59,
	maxLines = 3,
): string[] => {
	if (!text) return [] as string[];
	const fullWidthComma = "，";
	const encoded = encodeHTML(text);
	const isChinese = encoded.includes(fullWidthComma);

	let wrapped: string[] = [];

	if (isChinese) {
		wrapped = encoded.split(fullWidthComma); // Chinese full punctuation
	} else {
		wrapped = wrap(encoded, {
			width,
		}).split("\n"); // Split wrapped lines to get an array of lines
	}

	const lines = wrapped.map((line) => line.trim()).slice(0, maxLines); // Only consider maxLines lines

	if (wrapped.length > maxLines) {
		lines[maxLines - 1] += "...";
	}

	const multiLineText = lines.filter(Boolean);
	return multiLineText;
};

const noop = (): void => {};
// return console instance based on the environment
const logger =
	process.env.NODE_ENV === "test" ? { log: noop, error: noop } : console;

const ONE_MINUTE = 60;
const FIVE_MINUTES = 300;
const TEN_MINUTES = 600;
const FIFTEEN_MINUTES = 900;
const THIRTY_MINUTES = 1800;
const TWO_HOURS = 7200;
const FOUR_HOURS = 14400;
const SIX_HOURS = 21600;
const EIGHT_HOURS = 28800;
const ONE_DAY = 86400;

const CONSTANTS = {
	ONE_MINUTE,
	FIVE_MINUTES,
	TEN_MINUTES,
	FIFTEEN_MINUTES,
	THIRTY_MINUTES,
	TWO_HOURS,
	FOUR_HOURS,
	SIX_HOURS,
	EIGHT_HOURS,
	ONE_DAY,
	CARD_CACHE_SECONDS: SIX_HOURS,
	ERROR_CACHE_SECONDS: TEN_MINUTES,
};

/**
 * Missing query parameter class.
 */
class MissingParamError extends Error {
	missedParams: string[];
	secondaryMessage?: string;

	/**
	 * Missing query parameter error constructor.
	 *
	 * @param {string[]} missedParams An array of missing parameters names.
	 * @param {string=} secondaryMessage Optional secondary message to display.
	 */
	constructor(missedParams: string[], secondaryMessage?: string) {
		const msg = `Missing params ${missedParams
			.map((p) => `"${p}"`)
			.join(", ")} make sure you pass the parameters in URL`;
		super(msg);
		this.missedParams = missedParams;
		this.secondaryMessage = secondaryMessage;
	}
}

const measureText = (str: string, fontSize = 10): number | undefined => {
	// prettier-ignore
	const widths = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0.2796875, 0.2765625,
        0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625,
        0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125,
        0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
        0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
        0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875,
        1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625,
        0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625,
        0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625,
        0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375,
        0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625,
        0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5,
        0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
        0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875,
        0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875,
        0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625,
      ];

	const avg = 0.5279276315789471;

	const ret = str
		?.split("")
		?.map((c) =>
			c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg,
		) as number[];

	if (ret.length > 1) {
		const length = ret.reduce((acc, cur) => acc + cur) * fontSize;
		return length;
	}
};

/**
 * Lowercase and trim string.
 *
 * @param {string} name String to lowercase and trim.
 * @returns {string} Lowercased and trimmed string.
 */
const lowercaseTrim = (name: string): string => name.toLowerCase().trim();

/**
 * Split array of languages in two columns.
 */
const chunkArray = <T>(arr: Array<T>, perChunk: number): Array<T> => {
	return arr.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / perChunk);

		if (!resultArray[chunkIndex]) {
			// @ts-ignore
			resultArray[chunkIndex] = []; // start a new chunk
		}

		// @ts-ignore
		resultArray[chunkIndex].push(item);

		return resultArray;
	}, []);
};

/**
 * Parse emoji from string.
 */
const parseEmojis = (str: string): string => {
	if (!str) {
		throw new Error("[parseEmoji]: str argument not provided");
	}
	return str.replace(/:\w+:/gm, (emoji) => {
		return toEmoji.get(emoji) || "";
	});
};

/**
 * Get diff in minutes between two dates.
 */
const dateDiff = (d1: Date, d2: Date): number => {
	const date1 = new Date(d1);
	const date2 = new Date(d2);
	const diff = date1.getTime() - date2.getTime();
	return Math.round(diff / (1000 * 60));
};

export {
	retryer,
	ERROR_CARD_LENGTH,
	renderError,
	createLanguageNode,
	iconWithLabel,
	encodeHTML,
	kFormatter,
	isValidHexColor,
	parseBoolean,
	parseArray,
	clampValue,
	isValidGradient,
	fallbackColor,
	request,
	flexLayout,
	getCardColors,
	wrapTextMultiline,
	logger,
	CONSTANTS,
	CustomError,
	MissingParamError,
	measureText,
	lowercaseTrim,
	chunkArray,
	parseEmojis,
	dateDiff,
};
