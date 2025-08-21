import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const countersTable = pgTable('counters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: integer('value').notNull().default(0), // Counter starts at 0
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Counter = typeof countersTable.$inferSelect; // For SELECT operations
export type NewCounter = typeof countersTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { counters: countersTable };