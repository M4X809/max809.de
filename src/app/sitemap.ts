import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: "https://max809.de",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://max809.de/qr-code-generator",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://max809.de/cube-timer",
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		}
	];
}
