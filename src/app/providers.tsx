'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
// import { env } from '~/env'

if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set")
  }
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    autocapture: true,
    capture_heatmaps: true,
    enable_heatmaps: true,
    disable_compression: true,
    enable_recording_console_log: true,


  })
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}