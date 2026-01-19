"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { env } from "~/env";

if (typeof window !== "undefined") {
	posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: "/ingest",
		person_profiles: env.NEXT_PUBLIC_NODE_ENV === "production" ? "always" : "identified_only", // or 'always' to create profiles for anonymous users as well
		autocapture: { url_ignorelist: ["http://localhost:3000/*"] },
		capture_heatmaps: env.NEXT_PUBLIC_NODE_ENV === "production",
		enable_heatmaps: env.NEXT_PUBLIC_NODE_ENV === "production",
		opt_out_capturing_by_default: env.NEXT_PUBLIC_NODE_ENV === "development",
		disable_compression: false,
		debug: false,
		enable_recording_console_log: false,
		cross_subdomain_cookie: true,

		session_recording: {
			maskAllInputs: false,
			maskInputOptions: {
				password: true,
				color: false,
				date: false,
				"datetime-local": false,
				email: false,
				month: false,
				number: false,
				range: false,
				search: false,
				tel: false,
				text: false,
				time: false,
				url: false,
				week: false,
				textarea: false,
				select: false,
			},
		},
	});
	console.log("env.NEXT_PUBLIC_NODE_ENV", env.NEXT_PUBLIC_NODE_ENV);
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
