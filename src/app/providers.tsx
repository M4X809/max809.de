'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { env } from '~/env'

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    autocapture: true,
    capture_heatmaps: true,
    enable_heatmaps: true,
    disable_compression: false,
    enable_recording_console_log: false,
    cross_subdomain_cookie: true,

  })
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}