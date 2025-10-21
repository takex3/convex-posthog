import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { PostHog } from "@samhoque/convex-posthog";
import { v } from "convex/values";

// Initialize the PostHog component
const posthog = new PostHog(components.posthog, {
  // API key and host will be read from environment variables:
  // POSTHOG_API_KEY and POSTHOG_HOST
  // Or you can pass them explicitly:
  // apiKey: process.env.POSTHOG_API_KEY,
  // host: process.env.POSTHOG_HOST,
});

/**
 * Example mutation that tracks a user signup event
 */
export const signupUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Your business logic here
    // For example, creating a user in the database
    console.log(`Signing up user: ${args.email}`);

    // Track the signup event
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: "user_signed_up",
      properties: {
        email: args.email,
        name: args.name,
        signupMethod: "email",
      },
    });

    return { success: true, userId: args.userId };
  },
});

/**
 * Example mutation that tracks a purchase event
 */
export const trackPurchase = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Your business logic here
    console.log(`User ${args.userId} purchased product ${args.productId}`);

    // Track the purchase event with properties
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: "product_purchased",
      properties: {
        productId: args.productId,
        amount: args.amount,
        currency: "USD",
      },
    });

    return { success: true };
  },
});

/**
 * Example mutation that tracks a custom event
 */
export const trackCustomEvent = mutation({
  args: {
    userId: v.string(),
    event: v.string(),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Track any custom event
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: args.event,
      properties: args.properties,
    });

    return { success: true };
  },
});

/**
 * Example query - queries can't track events directly,
 * but you can call a mutation that does
 */
export const getUser = query({
  args: { userId: v.string() },
  handler: async (_ctx, args) => {
    // Return user data
    return { userId: args.userId, message: "User data retrieved" };
  },
});
