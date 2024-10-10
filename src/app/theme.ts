"use client";
import {
	ActionIcon,
	Button,
	Tooltip,
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
	},
};
