import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("PostHog example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("signupUser tracks event", async () => {
    const t = initConvexTest();
    const result = await t.mutation(api.example.signupUser, {
      userId: "user_123",
      email: "test@example.com",
      name: "Test User",
    });
    expect(result).toEqual({ success: true, userId: "user_123" });
  });

  test("trackPurchase tracks event", async () => {
    const t = initConvexTest();
    const result = await t.mutation(api.example.trackPurchase, {
      userId: "user_123",
      productId: "prod_456",
      amount: 99.99,
    });
    expect(result).toEqual({ success: true });
  });

  test("trackCustomEvent tracks event", async () => {
    const t = initConvexTest();
    const result = await t.mutation(api.example.trackCustomEvent, {
      userId: "user_123",
      event: "custom_event",
      properties: { foo: "bar" },
    });
    expect(result).toEqual({ success: true });
  });

  test("getUser query works", async () => {
    const t = initConvexTest();
    const result = await t.query(api.example.getUser, {
      userId: "user_123",
    });
    expect(result).toEqual({ userId: "user_123", message: "User data retrieved" });
  });
});
