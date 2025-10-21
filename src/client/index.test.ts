import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PostHog } from "./index.js";
import type { DataModelFromSchemaDefinition } from "convex/server";
import {
  anyApi,
  mutationGeneric,
} from "convex/server";
import type {
  ApiFromModules,
  MutationBuilder,
} from "convex/server";
import { v } from "convex/values";
import { defineSchema } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

// The schema for the tests
const schema = defineSchema({});
type DataModel = DataModelFromSchemaDefinition<typeof schema>;
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">;

const posthog = new PostHog(components.posthog, {
  apiKey: "test-api-key",
  host: "https://app.posthog.com",
});

export const testTrackEvent = mutation({
  args: {
    userId: v.string(),
    event: v.string(),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: args.event,
      properties: args.properties,
    });
    return { success: true };
  },
});

const testApi: ApiFromModules<{
  fns: {
    testTrackEvent: typeof testTrackEvent;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>["fns"] = anyApi["index.test"] as any;

describe("PostHog client", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("should create PostHog client with default options", () => {
    const client = new PostHog(components.posthog);
    expect(client).toBeInstanceOf(PostHog);
  });

  test("should create PostHog client with custom options", () => {
    const client = new PostHog(components.posthog, {
      apiKey: "custom-key",
      host: "https://custom-host.com",
    });
    expect(client).toBeInstanceOf(PostHog);
  });

  test("should track event from mutation", async () => {
    const t = initConvexTest(schema);
    const result = await t.mutation(testApi.testTrackEvent, {
      userId: "user_123",
      event: "test_event",
      properties: { foo: "bar" },
    });
    expect(result).toEqual({ success: true });
  });

  test("should track event without properties", async () => {
    const t = initConvexTest(schema);
    const result = await t.mutation(testApi.testTrackEvent, {
      userId: "user_123",
      event: "test_event",
    });
    expect(result).toEqual({ success: true });
  });

  test("should work with direct client usage", async () => {
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      // Track an event directly
      await posthog.trackUserEvent(ctx, {
        userId: "user_456",
        event: "direct_event",
        properties: { source: "test" },
      });
      // If we get here without throwing, the test passes
    });
  });

  test("should handle empty API key gracefully", async () => {
    const emptyKeyPosthog = new PostHog(components.posthog, {
      apiKey: "",
    });
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      // Should not throw, just log warning
      await emptyKeyPosthog.trackUserEvent(ctx, {
        userId: "user_789",
        event: "test_event",
      });
    });
  });
});
