export interface GHResponse {
	data: Data;
}

export interface Data {
	user: User;
	errors?: Record<string, any>;
}

export interface User {
	repositories: Repositories;
}

export interface Repositories {
	nodes: NodeElement[];
}

export interface NodeElement {
	name: string;
	languages: Languages;
	size: number;
	count: number;
}

export interface Languages {
	edges: Edge[];
}

export interface Edge {
	size: number;
	node: EdgeNode;
}

export interface EdgeNode {
	color: string;
	name: string;
}

export interface Fetcher {
	req: Response;
	res: GHResponse;
}

export type CommonOptions = {
	title_color: string;
	icon_color: string;
	text_color: string;
	bg_color: string;
	theme: ThemeNames;
	border_radius: number;
	border_color: string;
	locale: string;
	hide_border: boolean;
};

export type StatCardOptions = CommonOptions & {
	hide: string[];
	show_icons: boolean;
	hide_title: boolean;
	card_width: number;
	hide_rank: boolean;
	include_all_commits: boolean;
	line_height: number | string;
	custom_title: string;
	disable_animations: boolean;
	number_format: string;
	ring_color: string;
	text_bold: boolean;
	// rank_icon: RankIcon;
	show: string[];
};

type ThemeNames = keyof typeof import("./_themes");

export type RepoCardOptions = CommonOptions & {
	show_owner: boolean;
	description_lines_count: number;
};

export type TopLangOptions = CommonOptions & {
	hide_title: boolean;
	card_width: number;
	hide: string[];
	layout: "compact" | "normal" | "donut" | "donut-vertical" | "pie";
	custom_title: string;
	langs_count: number;
	disable_animations: boolean;
	hide_progress: boolean;
};
