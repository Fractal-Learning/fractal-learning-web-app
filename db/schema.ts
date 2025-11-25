import { pgTable, text, timestamp, uniqueIndex, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const orgTypeEnum = pgEnum("org_type", ["district", "school", "personal"]);

// Core Identity - Stable & Anonymous
export const users = pgTable("users", {
  // Clerk user ID (e.g., "user_...")
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// PII - Separated for Scrubbing/Privacy
export const usersPii = pgTable(
  "users_pii",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").notNull(),
    imageUrl: text("image_url"),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("users_pii_email_idx").on(table.email),
    };
  }
);

// Teacher Profiles - Role specific data
export const teacherProfiles = pgTable("teacher_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  schoolName: text("school_name"),
  state: text("state"),
  grades: jsonb("grades"), // e.g. ["K", "1", "2"]
  yearsExperience: integer("years_experience"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Organizations - Hierarchy
export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(), // Clerk Org ID
    name: text("name").notNull(),
    slug: text("slug").unique(),
    type: orgTypeEnum("type").default("personal").notNull(),
    parentId: text("parent_id"), // Self-reference for District -> School
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      parentIdx: uniqueIndex("org_parent_idx").on(table.parentId, table.slug), // Optional: ensure slug uniqueness within a parent if needed, or just rely on global slug unique
    };
  }
);

// Export types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertUserPii = typeof usersPii.$inferInsert;
export type SelectUserPii = typeof usersPii.$inferSelect;

export type InsertTeacherProfile = typeof teacherProfiles.$inferInsert;
export type SelectTeacherProfile = typeof teacherProfiles.$inferSelect;

export type InsertOrganization = typeof organizations.$inferInsert;
export type SelectOrganization = typeof organizations.$inferSelect;
