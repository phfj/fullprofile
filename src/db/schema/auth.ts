import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { generateRandomString } from '../../lib/generation.service'
import { boolean } from "drizzle-orm/gel-core";

/**in SQLite:
 * UUIDs and session tokens are stored as text
 * - Security and enumeration attackes - using integer would make it easier for attackers to scrape your API by guessing a user ID e.g. user/4
 * - Info. Leakage: sequential IDs tell the world exactly how many users you have (if a competitor sees User ID 42, they know your app is brand new)
 * - Distributed Systems: if you need to scale of sync offline data, generating integer ID requires asking the db for the "next" number. UUID can safely generate right in your JS code without waiting on the db, gauranteed never to collide
 * - best practice is to use UUIDv7 or ULIDs
 * Timestamps are handled by storing them as integers (Unix epochs) or text strings using mode: 'timestamp' (lets Drizzle automatically convert JS Date objects for you under the hood)
 **/

export enum Roles {
  Developer = 'Developer',
  Admin = 'Admin',
  Staff = 'Staff',
  Guest = 'Guest'
}

//users table
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(), //Generated manually is JS (e.g. crypto.randomUUID())
  role: text("role").$type<Roles>().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  confirmationCode: text("confirmation_code").$default(() =>
    generateRandomString(6).toUpperCase()
  ),
  isEmailVerified: integer("is_email_verified", { mode: 'boolean' }).notNull().$defaultFn(() => false),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$default(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

//sessions table
export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(), //Secure random token string
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull()
    .$default(() => {
      const thirtyDays = 1000 * 60 * 60 * 24 * 30;
      return new Date(Date.now() + thirtyDays).toISOString();
    }),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
});
