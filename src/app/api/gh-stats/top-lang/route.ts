import type { NextRequest } from "next/server";

import {
	CustomError,
	logger,
	MissingParamError,
	parseArray,
	parseBoolean,
	renderError,
	request,
	retryer,
	wrapTextMultiline,
} from "~/app/api/gh-stats/_utils";
import type { Fetcher, TopLangOptions } from "../_types";
import { renderTopLanguages } from "../_Cards/TopLangCard";

// export const revalidate = 1;

export type Lang = {
	name: string;
	color: string;
	size: number;
};

export type TopLangData = Record<string, Lang>;
import { unstable_cache } from "next/cache";

const fetcher = (
	variables: Record<string, string>,
	token?: string,
	retries?: number,
): Promise<Fetcher> => {
	return request(
		{
			query: `
        query userInfo($login: String!) {
          user(login: $login) {
            # fetch only owner repos & not forks
            repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
              nodes {
                name
                languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                  edges {
                    size
                    node {
                      color
                      name
                    }
                  }
                }
              }
            }
          }
        }
        `,
			variables,
		},
		{
			Authorization: `token ${token}`,
		},
	);
};

const fetchTopLanguages = async (
	username: string,
	exclude_repo = [],
	size_weight = 1,
	count_weight = 0,
) => {
	if (!username) {
		throw new MissingParamError(["username"]);
	}

	const { res } = await retryer(fetcher, { login: username });
	// return res;

	// console.log("res", JSON.stringify(res, null, 2));

	if (res.data.errors) {
		logger.error(res.data.errors);
		if (res.data.errors[0].type === "NOT_FOUND") {
			throw new CustomError(
				res.data.errors[0].message || "Could not fetch user.",
				CustomError.USER_NOT_FOUND,
			);
		}
		if (res.data.errors[0].message) {
			throw new CustomError(
				wrapTextMultiline(res.data.errors[0].message, 90, 1)[0],
			);
		}
		throw new CustomError(
			"Something went wrong while trying to retrieve the language data using the GraphQL API.",
			CustomError.GRAPHQL_ERROR,
		);
	}

	let repoNodes = res.data.user.repositories.nodes;
	const repoToHide: Record<string, boolean> = {};

	// populate repoToHide map for quick lookup
	// while filtering out
	if (exclude_repo) {
		for (const repoName of exclude_repo) {
			repoToHide[repoName] = true;
		}
	}

	// filter out repositories to be hidden
	repoNodes = repoNodes
		.sort((a, b) => b.size - a.size)
		.filter((name) => !repoToHide[name.name]);

	let repoCount = 0;

	repoNodes = repoNodes
		.filter((node) => node.languages.edges.length > 0)
		// flatten the list of language nodes
		// @ts-ignore
		.reduce((acc, curr) => curr.languages.edges.concat(acc), [])
		// @ts-ignore
		.reduce((acc, prev) => {
			// get the size of the language (bytes)
			let langSize = prev.size;

			// if we already have the language in the accumulator
			// & the current language name is same as previous name
			// add the size to the language size and increase repoCount.
			if (acc[prev.node.name] && prev.node.name === acc[prev.node.name].name) {
				langSize = prev.size + acc[prev.node.name].size;
				repoCount += 1;
			} else {
				// reset repoCount to 1
				// language must exist in at least one repo to be detected
				repoCount = 1;
			}
			return {
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				...acc,
				[prev.node.name]: {
					name: prev.node.name,
					color: prev.node.color,
					size: langSize,
					count: repoCount,
				},
			};
		}, {});

	for (const name of Object.keys(repoNodes) as any) {
		// comparison index calculation
		if (repoNodes[name]) {
			repoNodes[name].size =
				// biome-ignore lint/style/useExponentiationOperator: <explanation>
				Math.pow(repoNodes[name].size, size_weight) *
				// biome-ignore lint/style/useExponentiationOperator: <explanation>
				Math.pow(repoNodes[name].count, count_weight);
		}
	}

	const topLangs = Object.keys(repoNodes)
		.sort((a, b) => {
			// @ts-ignore
			const sizeA = repoNodes[a as keyof typeof repoNodes]?.size;
			// @ts-ignore
			const sizeB = repoNodes[b as keyof typeof repoNodes]?.size;
			return (sizeB ?? 0) - (sizeA ?? 0);
		})
		.reduce<
			Record<string, NonNullable<(typeof repoNodes)[keyof typeof repoNodes]>>
		>((result, key) => {
			const node = repoNodes[key as keyof typeof repoNodes];
			if (node) {
				result[key] = node;
			}
			return result;
		}, {});

	return topLangs;
};

const cachedTopLangs = unstable_cache(
	async (username) => fetchTopLanguages(username),
	["gh-stats"],
	{ revalidate: 120, tags: ["gh-stats"] },
);

export async function GET(req: NextRequest) {
	const __params = req.nextUrl.searchParams;
	const _params = req.nextUrl.searchParams.entries();
	const params = Array.from(_params).reduce<Record<string, string>>(
		(acc, [key, value]) => {
			acc[key] = value;
			return acc;
		},
		{},
	);
	// console.log("params", params);
	// prettier-ignore
	const usernameWhitelist = [
        "m4x809", 
        "skycreat7",
    ];

	const username = __params.get("username") ?? "m4x809";
	const theme = __params.get("theme");
	if (!username)
		return new Response(
			renderError(
				"Missing username",
				"Please provide a username. like ?username=m4x809",
				{
					theme: theme as unknown as TopLangOptions["theme"],
				},
			),
			{
				status: 400,
				headers: {
					"Content-Type": "image/svg+xml",
				},
			},
		);
	if (!usernameWhitelist.includes(username.toLowerCase()))
		return new Response(
			renderError(
				"Invalid username",
				`The username "${username}" is not whitelisted!`,
				{
					theme: theme as unknown as TopLangOptions["theme"],
				},
			),
			{
				status: 400,
				headers: {
					"Content-Type": "image/svg+xml",
				},
			},
		);

	const custom_title = __params.get("custom_title");
	const hide_title = __params.get("hide_title");
	const hide_border = __params.get("hide_border");
	const card_width = __params.get("card_width");
	const hide = __params.get("hide");
	const title_color = __params.get("title_color");
	const text_color = __params.get("text_color");
	const bg_color = __params.get("bg_color");

	const layout = __params.get("layout");
	const langs_count = __params.get("langs_count");
	const border_radius = __params.get("border_radius");
	const border_color = __params.get("border_color");
	const locale = __params.get("locale");
	const disable_animations = __params.get("disable_animations");
	const hide_progress = __params.get("hide_progress");

	if (!username) return new Response("Missing username", { status: 400 });
	try {
		const topLangs = await cachedTopLangs(username);
		// console.log("topLangs", topLangs);

		return new Response(
			renderTopLanguages(topLangs as unknown as TopLangData, {
				custom_title: custom_title ?? undefined,
				hide_title: parseBoolean(!!hide_title),
				hide_border: parseBoolean(!!hide_border),
				card_width: card_width ? Number.parseInt(card_width, 10) : undefined,
				hide: hide ? parseArray(hide) : undefined,
				title_color: title_color ?? undefined,
				text_color: text_color ?? undefined,
				bg_color: bg_color ?? undefined,
				layout: layout as unknown as TopLangOptions["layout"],
				langs_count: langs_count ? Number.parseInt(langs_count, 10) : undefined,
				border_radius: border_radius
					? Number.parseInt(border_radius, 10)
					: undefined,
				border_color: border_color ?? undefined,
				locale: locale ? locale.toLowerCase() : undefined,
				disable_animations: parseBoolean(!!disable_animations),
				hide_progress: parseBoolean(!!hide_progress),
				theme: theme as unknown as TopLangOptions["theme"],
			}),
			{
				headers: {
					"Content-Type": "image/svg+xml",
				},
			},
		);

		// return new Response(JSON.stringify(topLangs), { status: 200 });
	} catch (error) {
		console.error(error);
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
		return new Response("Something went wrong", { status: 500 });
	}
}
