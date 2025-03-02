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
		// reactCompiler: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
		dirs: ["./public"],
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
};

export default config;
