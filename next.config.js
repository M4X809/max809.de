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
	eslint: {
		ignoreDuringBuilds: true,
	},

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
		],
	},
	async rewrites() {
		return [
		  {
			source: "/ingest/static/:path*",
			destination: "https://eu-assets.i.posthog.com/static/:path*",
		  },
		  {
			source: "/ingest/:path*",
			destination: "https://eu.i.posthog.com/:path*",
		  },
		  {
			source: "/ingest/decide",
			destination: "https://eu.i.posthog.com/decide",
		  },
		];
	  },
	  // This is required to support PostHog trailing slash API requests
	  skipTrailingSlashRedirect: true, 
	
};

export default config;
