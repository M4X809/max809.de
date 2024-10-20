"use client";
import {
	ActionIcon,
	Autocomplete,
	Button,
	Input,
	Select,
	Tooltip,
	TooltipFloating,
	type MantineThemeOverride,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";

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
		TimeInput: TimeInput.extend({
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
		DatePicker: DatePicker.extend({
			classNames: {
				calendarHeader: "text-white bg-[rgba(0,0,0,0.15)] rounded-md",
				calendarHeaderControl: "bg-[rgba(0,0,0,0.05)]",
				day: "data-[selected=true]:bg-[rgba(255,255,255,0.1)] data-[selected=true]:text-white data-[today=true]:bg-[rgba(255,255,255,0.3)] ",
			},
			styles: {
				day: {
					// @ts-ignore
					"--mantine-color-dark-5": "rgba(255,255,255,0.1)",
				},
			},
			// popoverProps:{
			// 	classNames: {
			// 		dropdown: "bg-[rgba(0,0,0,0.2)] backdrop-blur-xl rounded-md",
			// 	},
			// }
		}),

		Select: Select.extend({
			defaultProps: {
				classNames: {
					input: "bg-[rgba(255,255,255,0.05)] text-white",
					wrapper: "bg-transparent",
					dropdown: "backdrop-blur-lg bg-[rgba(0,0,0,0.3)] text-white",
					option:
						"hover:bg-[rgba(255,255,255,0.1)] rounded-md aria-[selected=true]:bg-[rgba(255,255,255,0.09)]",
				},
			},
		}),
		Autocomplete: Autocomplete.extend({
			defaultProps: {
				classNames: {
					input: "bg-[rgba(255,255,255,0.05)] text-white",
					wrapper: "bg-transparent",
					dropdown: "backdrop-blur-lg bg-[rgba(0,0,0,0.3)] text-white",
					option:
						"hover:bg-[rgba(255,255,255,0.1)] rounded-md aria-[selected=true]:bg-[rgba(255,255,255,0.09)]",
				},
			},
		}),
	},
};
