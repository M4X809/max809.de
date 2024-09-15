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
	productionBrowserSourceMaps: true,
	// productionBrowserSourceMaps: true,
	// output: "export",
	eslint: {
		ignoreDuringBuilds: true,
	},

	skipTrailingSlashRedirect: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "utfs.io",
				pathname: "/a/su1pkz07fn/*",
			},
		],
	},
};

export default config;
