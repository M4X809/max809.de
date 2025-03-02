import { Signale } from "signale";

export const createLogger = (scope: string, logLevel = "1") =>
	new Signale({
		scope,
		logLevel: logLevel,
		types: {
			success: {
				badge: "✔",
				color: "green",
				label: "",
				logLevel: "1",
			},
			error: {
				badge: "✖",
				color: "red",
				label: "",
				logLevel: "1",
			},
			await: {
				badge: "⏱",
				color: "blue",
				label: "",
				logLevel: "1",
			},
			fatal: {
				badge: "💀",
				color: "red",
				label: "",
				logLevel: "1",
			},
			divider: {
				badge: "🔹",
				color: "white",
				label: "-----------------------------------------------\n",
				logLevel: "1",
			},
			debug: {
				badge: "🐛",
				color: "green",
				label: "",
				logLevel: "2",
			},
		},
		config: {
			underlineMessage: false,
			underlineLabel: false,
			underlinePrefix: false,
			underlineSuffix: false,
			displayTimestamp: true,
		},
	});
