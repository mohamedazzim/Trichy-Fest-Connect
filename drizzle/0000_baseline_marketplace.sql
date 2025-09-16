CREATE TYPE "public"."listing_status" AS ENUM('active', 'sold', 'expired');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'inactive', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('producer', 'consumer');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"quantity" numeric(10, 2) NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"status" "listing_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" varchar(255) NOT NULL,
	"producer_id" varchar(255) NOT NULL,
	"images" text,
	"unit" varchar(50) NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"available_quantity" numeric(10, 2) NOT NULL,
	"min_order_quantity" numeric(10, 2) DEFAULT '1',
	"is_organic" boolean DEFAULT false,
	"harvest_date" timestamp,
	"expiry_date" timestamp,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"user_type" "user_type" DEFAULT 'consumer' NOT NULL,
	"image" varchar(255),
	"bio" text,
	"location" varchar(255),
	"phone" varchar(20),
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_producer_id_users_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listings_product_id_idx" ON "listings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_producer_id_idx" ON "products" USING btree ("producer_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");