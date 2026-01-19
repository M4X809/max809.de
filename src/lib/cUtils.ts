"use client";

import { useMounted, useDidUpdate } from "@mantine/hooks";
import clsx, { type ClassValue } from "clsx";
import type { SessionType } from "next-auth";
import { useRouter } from "next/navigation";
import { useTransition, useMemo } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useAppStore } from "~/providers/app-store-provider";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

	return h > 0 ? `${hStr}:${mStr}:${sStr}.${msStr}` : m > 0 ? `${mStr}:${sStr}.${msStr}` : `${sStr}.${msStr}`;
}

export function useIsStaff(session: SessionType) {
	return function isStaff() {
		if (!session) return false;
		if (session.user.admin === true) return true;
		if (session.user.staff === true) return true;
		return false;
	};
}

export function useIsAdmin(session: SessionType) {
	return function isAdmin() {
		if (!session) return false;
		if (session.user.admin) return true;
		return false;
	};
}

export function usePermission(session: SessionType) {
	return function hasPermission(permission: string | string[]) {
		if (!session) return false;
		if (session.user.admin) return true;
		if (Array.isArray(permission)) {
			if (permission.some((perm) => session.user.permissions?.includes(perm))) return true;
			return false;
		}
		if (session.user.permissions?.includes(permission)) return true;
		return false;
	};
}

export function useRefreshState({
	withToast = true,
	removeToastOnUnmounted = false,
}: {
	/**
	 * If true, a toast will be shown while the page is refreshing.
	 * Defaults to true.
	 */
	withToast?: boolean;

	/**
	 * If true, the toast will be hidden when the component is unmounted even if wasLoading is false.
	 * Defaults to false.
	 */
	removeToastOnUnmounted?: boolean;
} = {}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const wasLoading = useAppStore((state) => state.wasLoading);
	const setWasLoading = useAppStore((state) => state.setWasLoading);

	const isMounted = useMounted();

	const handleRefresh = useMemo(() => {
		return (
			/**
			 * The id of the toast to be closed when the page is refreshed.
			 */
			toastId?: string,
		) => {
			if (toastId) toast.dismiss(toastId);

			setWasLoading(true);

			if (removeToastOnUnmounted) {
				toast.loading("Die Seite wird neu geladen...", {
					id: "reload-toast",
					description: undefined,
				});
			}

			startTransition(() => {
				if (!isMounted) return;
				console.log("refresh");
				router.refresh();
			});
		};
	}, [removeToastOnUnmounted, setWasLoading, router, isMounted]);

	useDidUpdate(() => {
		if (isPending && wasLoading && withToast) {
			toast.loading("Die Seite wird neu geladen...", {
				id: "reload-toast",
				description: undefined,
			});
		} else if (!isPending && (wasLoading || (!isMounted && removeToastOnUnmounted))) {
			if (withToast) toast.dismiss("reload-toast");
			setWasLoading(false);
		}
		return () => {
			if (withToast) toast.dismiss("reload-toast");
			setWasLoading(false);
		};
	}, [isPending, wasLoading, withToast, isMounted, removeToastOnUnmounted, setWasLoading]);

	return { isPending, wasLoading, handleRefresh };
}
