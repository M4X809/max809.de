"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TrackingStore = {
	trackingBanner: boolean;
	setTrackingBanner: (trackingBanner: boolean) => void;
};

export const trackingStore = create<TrackingStore>()(
	persist(
		(set) => ({
			trackingBanner: true,
			setTrackingBanner: (trackingBanner: boolean) =>
				set(() => ({ trackingBanner })),
		}),
		{
			name: "tracking-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ ...state }),
			version: 4,
			migrate: (persistedState, version) => {
				console.log("migrate", persistedState, version);
				return {
					trackingBanner: true,
				};
			},
		},
	),
);
