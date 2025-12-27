CREATE TYPE "public"."status" AS ENUM('New', 'In Progress', 'Repaired', 'Scrap');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('Corrective', 'Preventive');--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"serial_number" text NOT NULL,
	"department" text,
	"location" text,
	"is_usable" boolean DEFAULT true,
	"maintenance_team_id" integer,
	CONSTRAINT "equipment_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"type" "type" DEFAULT 'Corrective',
	"status" "status" DEFAULT 'New',
	"equipment_id" integer,
	"assigned_technician" text,
	"scheduled_date" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_maintenance_team_id_teams_id_fk" FOREIGN KEY ("maintenance_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;