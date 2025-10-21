"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server.js";

// PostHog client will be initialized per-request since we can't use global state
// in a reliable way across different component instances

/**
 * Internal action for tracking events with PostHog
 * PostHog automatically adds: $timestamp, $lib, $lib_version, and other metadata
 */
export const trackEvent = internalAction({
  args: {
    apiKey: v.string(),
    host: v.optional(v.string()),
    userId: v.string(),
    event: v.string(),
    properties: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    // Skip if API key not configured
    if (!args.apiKey) {
      return;
    }

    try {
      // Dynamically import PostHog in Node action
      const { PostHog } = await import("posthog-node");

      const client = new PostHog(args.apiKey, {
        host: args.host ?? "https://app.posthog.com",
        flushAt: 1, // Flush immediately for backend events
        flushInterval: 0,
      });

      client.capture({
        distinctId: args.userId,
        event: args.event,
        properties: {
          ...args.properties,
          source: "backend", // Mark as backend event for filtering
        },
      });

      await client.flush();
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.warn("PostHog tracking failed:", error);
    }
  },
});
