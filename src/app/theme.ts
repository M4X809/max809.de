"use client";
import {
	ActionIcon,
	Button,
	Input,
	Tooltip,
	TooltipFloating,
	type MantineThemeOverride,
} from "@mantine/core";

export const theme: MantineThemeOverride = {
	focusRing: "never",
	components: {
		Button: Button.extend({
			classNames: {
				root:
					"data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed",
			},
		}),
		ActionIcon: ActionIcon.extend({
			classNames: {
				root:
					"data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg data-[disabled=true]:cursor-not-allowed",
			},
		}),
		Tooltip: Tooltip.extend({
			defaultProps: {
				// className: " backdrop-blur-xl",
				bg: "rgba(0,0,0,0.35)",
				c: "white",
			},
			classNames: {
				tooltip: " backdrop-blur-xl ",
			},
		}),
		TooltipFloating: TooltipFloating.extend({
			defaultProps: {
				// className: " backdrop-blur-xl",
				bg: "rgba(0,0,0,0.35)",
				c: "white",
			},
			classNames: {
				tooltip: " backdrop-blur-xl ",
			},
		}),
		Input: Input.extend({
			defaultProps: {
				styles: {
					wrapper: {
						background: "transparent",
					},
					input: {
						background: "rgba(255,255,255,0.05)",
					},
				},
			},
		}),
	},
};
