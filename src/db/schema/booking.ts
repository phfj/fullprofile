import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { usersTable } from './auth';
import { programTable } from './clinic';

export const bookingsTable = sqliteTable('booking', {
    id: text('id').primaryKey(),
    condition: text('condition').notNull(),
    guestId: text('guest_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    programId: text('programId').notNull().references(() => programTable.id, { onDelete: 'cascade' }),
    price: text('price').notNull(),
    createdAt: text('createdAt').notNull().$default(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$default(() => new Date().toISOString()).$onUpdateFn(() => new Date().toISOString()),
});