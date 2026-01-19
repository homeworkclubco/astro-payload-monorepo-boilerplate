import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`general_homepage_id\` integer,
  	\`general_site_name\` text DEFAULT 'Boilerplate' NOT NULL,
  	\`general_site_url\` text DEFAULT 'https://kurtstubbings.com' NOT NULL,
  	\`seo_default_description\` text,
  	\`seo_default_image_id\` integer,
  	\`seo_favicon_id\` integer,
  	\`social_twitter_handle\` text,
  	\`social_facebook_url\` text,
  	\`social_instagram_url\` text,
  	\`social_linkedin_url\` text,
  	\`social_youtube_url\` text,
  	\`organization_name\` text,
  	\`organization_logo_id\` integer,
  	\`organization_contact_email\` text,
  	\`organization_contact_phone\` text,
  	\`organization_address_street_address\` text,
  	\`organization_address_city\` text,
  	\`organization_address_state\` text,
  	\`organization_address_postal_code\` text,
  	\`organization_address_country\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`general_homepage_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_default_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`organization_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_general_general_homepage_idx\` ON \`site_settings\` (\`general_homepage_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_seo_seo_default_image_idx\` ON \`site_settings\` (\`seo_default_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_seo_seo_favicon_idx\` ON \`site_settings\` (\`seo_favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_organization_organization_logo_idx\` ON \`site_settings\` (\`organization_logo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings\`;`)
}
