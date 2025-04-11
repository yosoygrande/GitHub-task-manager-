import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tasks: defineTable({
    name: v.string(),
    time: v.string(),
    completed: v.boolean(),
    userId: v.id("users"),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
