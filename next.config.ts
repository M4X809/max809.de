import type { NextConfig } from "next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "./src/env";

env;

const config = {
	output: "standalone",
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
		// reactCompiler: true,
	},

	typescript: {
		ignoreBuildErrors: true,
	},

	skipTrailingSlashRedirect: true,
	devIndicators: {
		position: "bottom-left",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "utfs.io",
				pathname: "/a/su1pkz07fn/*",
			},
			{
				protocol: "https",
				hostname: "max809.de",
				pathname: "/api/gh-stats/*",
			},
		],
	},
} satisfies NextConfig;

export default config;
