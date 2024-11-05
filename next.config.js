/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	output: "standalone",
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
	eslint: {
		ignoreDuringBuilds: true,
		dirs: [
			"./public"
		]
	},
	

	skipTrailingSlashRedirect: true,
	devIndicators: {
		buildActivity: true,
		buildActivityPosition: "bottom-right",
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
			}
		],
	},
};

export default config;
