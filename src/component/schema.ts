import { defineSchema } from "convex/server";

// PostHog component doesn't need any database tables
// All tracking is done via API calls
export default defineSchema({});
