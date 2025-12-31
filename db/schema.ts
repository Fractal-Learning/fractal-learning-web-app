import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const orgTypeEnum = pgEnum('org_type', [
  'district',
  'school',
  'personal',
]);

// Core Identity - Stable & Anonymous
export const users = pgTable('users', {
  // Clerk user ID (e.g., "user_...")
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// PII - Separated for Scrubbing/Privacy
export const usersPii = pgTable(
  'users_pii',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email').notNull(),
    imageUrl: text('image_url'),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('users_pii_email_idx').on(table.email),
    };
  }
);

// Teacher Profiles - Role specific data
export const teacherProfiles = pgTable('teacher_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  schoolName: text('school_name'),
  state: text('state'),
  grades: jsonb('grades'), // e.g. ["K", "1", "2"]
  yearsExperience: integer('years_experience'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// US States - lookup table
export const usStates = pgTable(
  'us_states',
  {
    // ISO 3166-2:US / USPS code (e.g. "CA")
    code: text('code').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex('us_states_name_unique').on(table.name),
    };
  }
);

// NCES CCD Directory caches (Urban Institute API)
export const ncesDistrictCache = pgTable(
  'nces_district_cache',
  {
    leaid: text('leaid').primaryKey(),
    leaName: text('lea_name').notNull(),
    fips: integer('fips').notNull(),

    dataOrigin: text('data_origin')
      .notNull()
      .default('urban_educationdata_ccd_api'),
    dataset: text('dataset').notNull().default('ccd'),
    datasetYear: integer('dataset_year').notNull(),

    sourceRowHash: text('source_row_hash'),
    raw: jsonb('raw').notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    fipsYearIdx: index('nces_district_fips_year_idx').on(t.fips, t.datasetYear),
  })
);

export const ncesSchoolCache = pgTable(
  'nces_school_cache',
  {
    ncessch: text('ncessch').primaryKey(),
    schoolName: text('school_name').notNull(),
    leaid: text('leaid').notNull(),

    dataOrigin: text('data_origin')
      .notNull()
      .default('urban_educationdata_ccd_api'),
    dataset: text('dataset').notNull().default('ccd'),
    datasetYear: integer('dataset_year').notNull(),

    sourceRowHash: text('source_row_hash'),
    raw: jsonb('raw').notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    leaidYearIdx: index('nces_school_leaid_year_idx').on(t.leaid, t.datasetYear),
  })
);

// Organizations - Hierarchy
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(), // Clerk Org ID
  name: text('name').notNull(),
  slug: text('slug').unique(),
  type: orgTypeEnum('type').default('personal').notNull(),
  parentId: text('parent_id'), // Self-reference for District -> School
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Export types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertUserPii = typeof usersPii.$inferInsert;
export type SelectUserPii = typeof usersPii.$inferSelect;

export type InsertTeacherProfile = typeof teacherProfiles.$inferInsert;
export type SelectTeacherProfile = typeof teacherProfiles.$inferSelect;

export type InsertUsState = typeof usStates.$inferInsert;
export type SelectUsState = typeof usStates.$inferSelect;

export type InsertNcesDistrictCache = typeof ncesDistrictCache.$inferInsert;
export type SelectNcesDistrictCache = typeof ncesDistrictCache.$inferSelect;

export type InsertNcesSchoolCache = typeof ncesSchoolCache.$inferInsert;
export type SelectNcesSchoolCache = typeof ncesSchoolCache.$inferSelect;

export type InsertOrganization = typeof organizations.$inferInsert;
export type SelectOrganization = typeof organizations.$inferSelect;
