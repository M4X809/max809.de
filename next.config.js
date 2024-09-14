/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
	// productionBrowserSourceMaps: true,
	// output: "export",
	eslint: {
		ignoreDuringBuilds: true,
	},
	skipTrailingSlashRedirect: true,
};

export default config;
