import { Card } from "../_Card";
import { createProgressNode } from "../_createProgressNode";
import type { TopLangOptions } from "../_types";
// import { I18n } from "../common/I18n.js";
import {
	chunkArray,
	clampValue,
	flexLayout,
	getCardColors,
	lowercaseTrim,
	measureText,
} from "../_utils";
import type { TopLangData } from "./route";
// import { langCardLocales } from "../translations.js";

const DEFAULT_CARD_WIDTH = 300;
const MIN_CARD_WIDTH = 280;
const DEFAULT_LANG_COLOR = "#858585";
const CARD_PADDING = 25;
const COMPACT_LAYOUT_BASE_HEIGHT = 90;
const MAXIMUM_LANGS_COUNT = 20;

const NORMAL_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const COMPACT_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const PIE_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_VERTICAL_LAYOUT_DEFAULT_LANGS_COUNT = 6;

type Lang = {
	name: string;
	color: string;
	size: number;
};
/**
 * Retrieves the programming language whose name is the longest.
 */
const getLongestLang = (
	arr: Lang[],
): { name: string; size: number; color: string } =>
	arr.reduce(
		(savedLang, lang) =>
			lang.name.length > savedLang.name.length ? lang : savedLang,
		{ name: "", size: 0, color: "" },
	);

/**
 * Convert degrees to radians.
 */
const degreesToRadians = (angleInDegrees: number): number =>
	angleInDegrees * (Math.PI / 180.0);

/**
 * Convert radians to degrees.
 */
const radiansToDegrees = (angleInRadians: number): number =>
	angleInRadians / (Math.PI / 180.0);

/**
 * Convert polar coordinates to cartesian coordinates.
 */
const polarToCartesian = (
	centerX: number,
	centerY: number,
	radius: number,
	angleInDegrees: number,
): { x: number; y: number } => {
	const rads = degreesToRadians(angleInDegrees);
	return {
		x: centerX + radius * Math.cos(rads),
		y: centerY + radius * Math.sin(rads),
	};
};

/**
 * Convert cartesian coordinates to polar coordinates.
 */
const cartesianToPolar = (
	centerX: number,
	centerY: number,
	x: number,
	y: number,
): { radius: number; angleInDegrees: number } => {
	const radius = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
	let angleInDegrees = radiansToDegrees(Math.atan2(y - centerY, x - centerX));
	if (angleInDegrees < 0) {
		angleInDegrees += 360;
	}
	return { radius, angleInDegrees };
};

/**
 * Calculates length of circle.
 */
const getCircleLength = (radius: number): number => {
	return 2 * Math.PI * radius;
};

/**
 * Calculates height for the compact layout.
 */
const calculateCompactLayoutHeight = (totalLangs: number): number => {
	return COMPACT_LAYOUT_BASE_HEIGHT + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates height for the normal layout.
 */
const calculateNormalLayoutHeight = (totalLangs: number): number => {
	return 45 + (totalLangs + 1) * 40;
};

/**
 * Calculates height for the donut layout.
 */
const calculateDonutLayoutHeight = (totalLangs: number): number => {
	return 215 + Math.max(totalLangs - 5, 0) * 32;
};

/**
 * Calculates height for the donut vertical layout.
 */
const calculateDonutVerticalLayoutHeight = (totalLangs: number): number => {
	return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates height for the pie layout.
 */
const calculatePieLayoutHeight = (totalLangs: number): number => {
	return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates the center translation needed to keep the donut chart centred.
 */
const donutCenterTranslation = (totalLangs: number): number => {
	return -45 + Math.max(totalLangs - 5, 0) * 16;
};

/**
 * Trim top languages to lang_count while also hiding certain languages.
 */
const trimTopLanguages = (
	topLangs: Record<string, Lang>,
	langs_count: number,
	hide: string[] | undefined,
): { langs: Lang[]; totalLanguageSize: number } => {
	let langs = Object.values(topLangs);
	const langsToHide: Record<string, boolean> = {};
	const langsCount = clampValue(langs_count, 1, MAXIMUM_LANGS_COUNT);

	// populate langsToHide map for quick lookup
	// while filtering out
	if (hide) {
		for (const langName of hide) {
			langsToHide[lowercaseTrim(langName) as keyof typeof langsToHide] = true;
		}
	}

	// filter out languages to be hidden
	langs = langs
		.sort((a, b) => b.size - a.size)
		.filter((lang) => {
			return !langsToHide[lowercaseTrim(lang.name)];
		})
		.slice(0, langsCount);

	const totalLanguageSize = langs.reduce((acc, curr) => acc + curr.size, 0);

	return { langs, totalLanguageSize };
};

/**
 * Create progress bar text item for a programming language.
 */
const createProgressTextNode = ({
	width,
	color,
	name,
	progress,
	index,
}: {
	width: number;
	color: string;
	name: string;
	progress: number;
	index: number;
}): string => {
	const staggerDelay = (index + 3) * 150;
	const paddingRight = 95;
	const progressTextX = width - paddingRight + 10;
	const progressWidth = width - paddingRight;

	return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <text data-testid="lang-name" x="2" y="15" class="lang-name">${name}</text>
      <text x="${progressTextX}" y="34" class="lang-name">${progress}%</text>
      ${createProgressNode({
							x: 0,
							y: 25,
							color,
							width: progressWidth,
							progress,
							progressBarBackgroundColor: "#ddd",
							delay: staggerDelay + 300,
						})}
    </g>
  `;
};

/**
 * Creates compact text item for a programming language.
 */
const createCompactLangNode = ({
	lang,
	totalSize,
	hideProgress,
	index,
}: {
	lang: Lang;
	totalSize: number;
	hideProgress?: boolean | undefined;
	index: number;
}): string => {
	const percentage = ((lang.size / totalSize) * 100).toFixed(2);
	const staggerDelay = (index + 3) * 150;
	const color = lang.color || "#858585";

	return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <circle cx="5" cy="6" r="5" fill="${color}" />
      <text data-testid="lang-name" x="15" y="10" class='lang-name'>
        ${lang.name} ${hideProgress ? "" : `${percentage}%`}
      </text>
    </g>
  `;
};

/**
 * Create compact languages text items for all programming languages.
 */
const createLanguageTextNode = ({
	langs,
	totalSize,
	hideProgress,
}: {
	langs: Lang[];
	totalSize: number;
	hideProgress?: boolean | undefined;
}): string => {
	const longestLang = getLongestLang(langs);
	const chunked = chunkArray(langs, langs.length / 2);
	const layouts = chunked.map((array) => {
		// @ts-ignore
		const items = array.map((lang, index) =>
			createCompactLangNode({
				lang,
				totalSize,
				hideProgress,
				index,
			}),
		);
		return flexLayout({
			items,
			gap: 25,
			direction: "column",
		}).join("");
	});

	const percent = ((longestLang.size / totalSize) * 100).toFixed(2);
	const minGap = 150;
	const maxGap = 20 + (measureText(`${longestLang.name} ${percent}%`, 11) ?? 0);
	return flexLayout({
		items: layouts,
		gap: maxGap < minGap ? minGap : maxGap,
	}).join("");
};

/**
 * Create donut languages text items for all programming languages.
 */
const createDonutLanguagesNode = ({
	langs,
	totalSize,
}: {
	langs: Lang[];
	totalSize: number;
}): string => {
	return flexLayout({
		items: langs.map((lang, index) => {
			return createCompactLangNode({
				lang,
				totalSize,
				hideProgress: false,
				index,
			});
		}),
		gap: 32,
		direction: "column",
	}).join("");
};

/**
 * Renders the default language card layout.
 */
const renderNormalLayout = (
	langs: Lang[],
	width: number,
	totalLanguageSize: number,
): string => {
	return flexLayout({
		items: langs.map((lang, index) => {
			return createProgressTextNode({
				width,
				name: lang.name,
				color: lang.color || DEFAULT_LANG_COLOR,
				progress: Number.parseFloat(
					((lang.size / totalLanguageSize) * 100).toFixed(2),
				),
				index,
			});
		}),
		gap: 40,
		direction: "column",
	}).join("");
};

/**
 * Renders the compact language card layout.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} width Card width.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {boolean=} hideProgress Whether to hide progress bar.
 * @returns {string} Compact layout card SVG object.
 */
const renderCompactLayout = (
	langs: Lang[],
	width: number,
	totalLanguageSize: number,
	hideProgress: boolean | undefined,
): string => {
	const paddingRight = 50;
	const offsetWidth = width - paddingRight;
	// progressOffset holds the previous language's width and used to offset the next language
	// so that we can stack them one after another, like this: [--][----][---]
	let progressOffset = 0;
	const compactProgressBar = langs
		.map((lang) => {
			const percentage = Number.parseFloat(
				((lang.size / totalLanguageSize) * offsetWidth).toFixed(2),
			);

			const progress = percentage < 10 ? percentage + 10 : percentage;

			const output = `
        <rect
          mask="url(#rect-mask)"
          data-testid="lang-progress"
          x="${progressOffset}"
          y="0"
          width="${progress}"
          height="8"
          fill="${lang.color || "#858585"}"
        />
      `;
			progressOffset += percentage;
			return output;
		})
		.join("");

	return `
  ${
			hideProgress
				? ""
				: `
      <mask id="rect-mask">
          <rect x="0" y="0" width="${offsetWidth}" height="8" fill="white" rx="5"/>
        </mask>
        ${compactProgressBar}
      `
		}
    <g transform="translate(0, ${hideProgress ? "0" : "25"})">
      ${createLanguageTextNode({
							langs,
							totalSize: totalLanguageSize,
							hideProgress,
						})}
    </g>
  `;
};

/**
 * Renders donut vertical layout to display user's most frequently used programming languages.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} totalLanguageSize Total size of all languages.
 * @returns {string} Compact layout card SVG object.
 */
const renderDonutVerticalLayout = (
	langs: Lang[],
	totalLanguageSize: number,
): string => {
	// Donut vertical chart radius and total length
	const radius = 80;
	const totalCircleLength = getCircleLength(radius);

	// SVG circles
	const circles = [];

	// Start indent for donut vertical chart parts
	let indent = 0;

	// Start delay coefficient for donut vertical chart parts
	let startDelayCoefficient = 1;

	// Generate each donut vertical chart part
	for (const lang of langs) {
		const percentage = (lang.size / totalLanguageSize) * 100;
		const circleLength = totalCircleLength * (percentage / 100);
		const delay = startDelayCoefficient * 100;

		circles.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <circle 
          cx="150"
          cy="100"
          r="${radius}"
          fill="transparent"
          stroke="${lang.color}"
          stroke-width="25"
          stroke-dasharray="${totalCircleLength}"
          stroke-dashoffset="${indent}"
          size="${percentage}"
          data-testid="lang-donut"
        />
      </g>
    `);

		// Update the indent for the next part
		indent += circleLength;
		// Update the start delay coefficient for the next part
		startDelayCoefficient += 1;
	}

	return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="donut">
          ${circles.join("")}
        </svg>
      </g>
      <g transform="translate(0, 220)">
        <svg data-testid="lang-names" x="${CARD_PADDING}">
          ${createLanguageTextNode({
											langs,
											totalSize: totalLanguageSize,
											hideProgress: false,
										})}
        </svg>
      </g>
    </svg>
  `;
};

/**
 * Renders pie layout to display user's most frequently used programming languages.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} totalLanguageSize Total size of all languages.
 * @returns {string} Compact layout card SVG object.
 */
const renderPieLayout = (langs: Lang[], totalLanguageSize: number): string => {
	// Pie chart radius and center coordinates
	const radius = 90;
	const centerX = 150;
	const centerY = 100;

	// Start angle for the pie chart parts
	let startAngle = 0;

	// Start delay coefficient for the pie chart parts
	let startDelayCoefficient = 1;

	// SVG paths
	const paths = [];

	// Generate each pie chart part
	for (const lang of langs) {
		if (langs.length === 1) {
			paths.push(`
        <circle
          cx="${centerX}"
          cy="${centerY}"
          r="${radius}"
          stroke="none"
          fill="${lang.color}"
          data-testid="lang-pie"
          size="100"
        />
      `);
			break;
		}

		const langSizePart = lang.size / totalLanguageSize;
		const percentage = langSizePart * 100;
		// Calculate the angle for the current part
		const angle = langSizePart * 360;

		// Calculate the end angle
		const endAngle = startAngle + angle;

		// Calculate the coordinates of the start and end points of the arc
		const startPoint = polarToCartesian(centerX, centerY, radius, startAngle);
		const endPoint = polarToCartesian(centerX, centerY, radius, endAngle);

		// Determine the large arc flag based on the angle
		const largeArcFlag = angle > 180 ? 1 : 0;

		// Calculate delay
		const delay = startDelayCoefficient * 100;

		// SVG arc markup
		paths.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-pie"
          size="${percentage}"
          d="M ${centerX} ${centerY} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z"
          fill="${lang.color}"
        />
      </g>
    `);

		// Update the start angle for the next part
		startAngle = endAngle;
		// Update the start delay coefficient for the next part
		startDelayCoefficient += 1;
	}

	return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="pie">
          ${paths.join("")}
        </svg>
      </g>
      <g transform="translate(0, 220)">
        <svg data-testid="lang-names" x="${CARD_PADDING}">
          ${createLanguageTextNode({
											langs,
											totalSize: totalLanguageSize,
											hideProgress: false,
										})}
        </svg>
      </g>
    </svg>
  `;
};

/**
 * Creates the SVG paths for the language donut chart.
 *
 * @param {number} cx Donut center x-position.
 * @param {number} cy Donut center y-position.
 * @param {number} radius Donut arc Radius.
 * @param {number[]} percentages Array with donut section percentages.
 * @returns {{d: string, percent: number}[]}  Array of svg path elements
 */
const createDonutPaths = (
	cx: number,
	cy: number,
	radius: number,
	percentages: number[],
): { d: string; percent: number }[] => {
	const paths = [];
	let startAngle = 0;
	let endAngle = 0;

	const totalPercent = percentages.reduce((acc, curr) => acc + curr, 0);
	for (let i = 0; i < percentages.length; i++) {
		const tmpPath: { percent: number; d: string } = { percent: 0, d: "" };

		const percent = Number.parseFloat(
			(((percentages[i] ?? 10) / totalPercent) * 100).toFixed(2),
		);

		endAngle = 3.6 * percent + startAngle;
		const startPoint = polarToCartesian(cx, cy, radius, endAngle - 90); // rotate donut 90 degrees counter-clockwise.
		const endPoint = polarToCartesian(cx, cy, radius, startAngle - 90); // rotate donut 90 degrees counter-clockwise.
		const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

		tmpPath.percent = percent;
		tmpPath.d = `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}`;

		paths.push(tmpPath);
		startAngle = endAngle;
	}

	return paths;
};

/**
 * Renders the donut language card layout.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} width Card width.
 * @param {number} totalLanguageSize Total size of all languages.
 * @returns {string} Donut layout card SVG object.
 */
const renderDonutLayout = (
	langs: Lang[],
	width: number,
	totalLanguageSize: number,
): string => {
	const centerX = width / 3;
	const centerY = width / 3;
	const radius = centerX - 60;
	const strokeWidth = 12;

	const colors = langs.map((lang) => lang.color);
	const langsPercents = langs.map((lang) =>
		Number.parseFloat(((lang.size / totalLanguageSize) * 100).toFixed(2)),
	);

	const langPaths = createDonutPaths(centerX, centerY, radius, langsPercents);

	const donutPaths =
		langs.length === 1
			? `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${colors[0]}" fill="none" stroke-width="${strokeWidth}" data-testid="lang-donut" size="100"/>`
			: langPaths
					.map((section, index) => {
						const staggerDelay = (index + 3) * 100;
						const delay = staggerDelay + 300;

						const output = `
       <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-donut"
          size="${section.percent}"
          d="${section.d}"
          stroke="${colors[index]}"
          fill="none"
          stroke-width="${strokeWidth}">
        </path>
      </g>
      `;

						return output;
					})
					.join("");

	const donut = `<svg width="${width}" height="${width}">${donutPaths}</svg>`;

	return `
    <g transform="translate(0, 0)">
      <g transform="translate(0, 0)">
        ${createDonutLanguagesNode({ langs, totalSize: totalLanguageSize })}
      </g>

      <g transform="translate(125, ${donutCenterTranslation(langs.length)})">
        ${donut}
      </g>
    </g>
  `;
};

/**
 * Creates the no languages data SVG node.
 */
const noLanguagesDataNode = ({
	color,
	text,
	layout,
}: {
	color: string;
	text: string;
	layout: TopLangOptions["layout"] | undefined;
}): string => {
	return `
    <text x="${
					layout === "pie" || layout === "donut-vertical" ? CARD_PADDING : 0
				}" y="11" class="stat bold" fill="${color}">${text}</text>
  `;
};

/**
 * Get default languages count for provided card layout.
 *
 * @param {object} props Function properties.
 * @param {Layout=} props.layout Input layout string.
 * @param {boolean=} props.hide_progress Input hide_progress parameter value.
 * @returns {number} Default languages count for input layout.
 */
const getDefaultLanguagesCountByLayout = ({
	layout,
	hide_progress,
}: {
	layout?: TopLangOptions["layout"] | undefined;
	hide_progress?: boolean | undefined;
}): number => {
	if (layout === "compact" || hide_progress === true) {
		return COMPACT_LAYOUT_DEFAULT_LANGS_COUNT;
	}
	if (layout === "donut") {
		return DONUT_LAYOUT_DEFAULT_LANGS_COUNT;
	}
	if (layout === "donut-vertical") {
		return DONUT_VERTICAL_LAYOUT_DEFAULT_LANGS_COUNT;
	}
	if (layout === "pie") {
		return PIE_LAYOUT_DEFAULT_LANGS_COUNT;
	}
	return NORMAL_LAYOUT_DEFAULT_LANGS_COUNT;
};

/**
 * @typedef {import('../fetchers/types').TopLangData} TopLangData
 */

/**
 * Renders card that display user's most frequently used programming languages.
 *
 * @param {TopLangData} topLangs User's most frequently used programming languages.
 * @param {Partial<TopLangOptions>} options Card options.
 * @returns {string} Language card SVG object.
 */
const renderTopLanguages = (
	topLangs: TopLangData,
	options: Partial<TopLangOptions> = {},
): string => {
	const {
		hide_title = false,
		hide_border = false,
		card_width,
		title_color,
		text_color,
		bg_color,
		hide,
		hide_progress,
		theme,
		layout,
		custom_title,
		// locale,
		langs_count = getDefaultLanguagesCountByLayout({ layout, hide_progress }),
		border_radius,
		border_color,
		disable_animations,
	} = options;

	// const i18n = new I18n({
	// 	locale,
	// 	translations: langCardLocales,
	// });

	const { langs, totalLanguageSize } = trimTopLanguages(
		topLangs,
		langs_count,
		hide,
	);

	let width = card_width
		? Number.isNaN(card_width)
			? DEFAULT_CARD_WIDTH
			: card_width < MIN_CARD_WIDTH
				? MIN_CARD_WIDTH
				: card_width
		: DEFAULT_CARD_WIDTH;
	let height = calculateNormalLayoutHeight(langs.length);

	// returns theme based colors with proper overrides and defaults
	const colors = getCardColors({
		title_color,
		text_color,
		bg_color,
		border_color,
		theme: theme ?? "github_dark",
	});

	let finalLayout = "";
	if (langs.length === 0) {
		height = COMPACT_LAYOUT_BASE_HEIGHT;
		finalLayout = noLanguagesDataNode({
			color: colors.textColor,
			text: "No data",
			layout,
		});
	} else if (layout === "pie") {
		height = calculatePieLayoutHeight(langs.length);
		finalLayout = renderPieLayout(langs, totalLanguageSize);
	} else if (layout === "donut-vertical") {
		height = calculateDonutVerticalLayoutHeight(langs.length);
		finalLayout = renderDonutVerticalLayout(langs, totalLanguageSize);
	} else if (layout === "compact" || hide_progress === true) {
		height =
			calculateCompactLayoutHeight(langs.length) + (hide_progress ? -25 : 0);

		finalLayout = renderCompactLayout(
			langs,
			width,
			totalLanguageSize,
			hide_progress,
		);
	} else if (layout === "donut") {
		height = calculateDonutLayoutHeight(langs.length);
		width = width + 50; // padding
		finalLayout = renderDonutLayout(langs, width, totalLanguageSize);
	} else {
		finalLayout = renderNormalLayout(langs, width, totalLanguageSize);
	}

	const card = new Card({
		customTitle: custom_title,
		defaultTitle: "Top Languages",
		width,
		height,
		border_radius,
		colors,
	});

	if (disable_animations) {
		card.disableAnimations();
	}

	card.setHideBorder(hide_border);
	card.setHideTitle(hide_title);
	card.setCSS(
		`
    @keyframes slideInAnimation {
      from {
        width: 0;
      }
      to {
        width: calc(100%-100px);
      }
    }
    @keyframes growWidthAnimation {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${colors.textColor};
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .bold { font-weight: 700 }
    .lang-name {
      font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    #rect-mask rect{
      animation: slideInAnimation 1s ease-in-out forwards;
    }
    .lang-progress{
      animation: growWidthAnimation 0.6s ease-in-out forwards;
    }
    `,
	);

	if (layout === "pie" || layout === "donut-vertical") {
		return card.render(finalLayout);
	}

	return card.render(`
    <svg data-testid="lang-items" x="${CARD_PADDING}">
      ${finalLayout}
    </svg>
  `);
};

export {
	getLongestLang,
	degreesToRadians,
	radiansToDegrees,
	polarToCartesian,
	cartesianToPolar,
	getCircleLength,
	calculateCompactLayoutHeight,
	calculateNormalLayoutHeight,
	calculateDonutLayoutHeight,
	calculateDonutVerticalLayoutHeight,
	calculatePieLayoutHeight,
	donutCenterTranslation,
	trimTopLanguages,
	renderTopLanguages,
	MIN_CARD_WIDTH,
	getDefaultLanguagesCountByLayout,
};
