CREATE TABLE "nces_district_cache" (
	"leaid" text PRIMARY KEY NOT NULL,
	"lea_name" text NOT NULL,
	"fips" integer NOT NULL,
	"data_origin" text DEFAULT 'urban_educationdata_ccd_api' NOT NULL,
	"dataset" text DEFAULT 'ccd' NOT NULL,
	"dataset_year" integer NOT NULL,
	"source_row_hash" text,
	"raw" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nces_school_cache" (
	"ncessch" text PRIMARY KEY NOT NULL,
	"school_name" text NOT NULL,
	"leaid" text NOT NULL,
	"data_origin" text DEFAULT 'urban_educationdata_ccd_api' NOT NULL,
	"dataset" text DEFAULT 'ccd' NOT NULL,
	"dataset_year" integer NOT NULL,
	"source_row_hash" text,
	"raw" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "nces_district_fips_year_idx" ON "nces_district_cache" USING btree ("fips","dataset_year");
--> statement-breakpoint
CREATE INDEX "nces_school_leaid_year_idx" ON "nces_school_cache" USING btree ("leaid","dataset_year");
