import { pgTable, serial, text, timestamp } from 'npm:drizzle-orm/pg-core';

// Define a sample table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});