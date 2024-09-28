"use client";
export function formatTime(msInput: number | string): string {
	// Convert input to a number if it's a string
	let ms = typeof msInput === "string" ? Number.parseInt(msInput, 10) : msInput;

	// Calculate hours, minutes, seconds, and milliseconds
	ms = ms / 1000;
	const h = Math.floor(ms / 3600);
	ms %= 3600;
	const m = Math.floor(ms / 60);
	ms %= 60;
	const s = Math.floor(ms);
	ms = Math.round((ms - s) * 1000);

	// Format milliseconds, seconds, minutes, and hours
	const msStr = ms.toString().padStart(3, "0");
	const sStr = s.toString().padStart(2, "0");
	const mStr = m > 0 ? m.toString().padStart(2, "0") : "";
	const hStr = h > 0 ? h.toString().padStart(2, "0") : "";

	return h > 0
		? `${hStr}:${mStr}:${sStr}.${msStr}`
		: m > 0
			? `${mStr}:${sStr}.${msStr}`
			: `${sStr}.${msStr}`;
}