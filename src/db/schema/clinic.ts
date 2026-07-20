import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accomodationTable = sqliteTable('accomodation', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('text').notNull(),
    price: text('price').notNull(),
    createdAt: text('createdAt').notNull().$default(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$default(() => new Date().toISOString()).$onUpdateFn(() => new Date().toISOString()),
});

export const programTable = sqliteTable('program', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    createdAt: text('createdAt').notNull().$default(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$default(() => new Date().toISOString()).$onUpdateFn(() => new Date().toISOString()),
});

export const accomodationPhotosTable = sqliteTable('accomodationPhotos', {
    id: text('id').primaryKey(),
    accomodationId: text('accomodation_id').notNull().references(() => accomodationTable.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt'),
    createdAt: text('createdAt').notNull().$default(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$default(() => new Date().toISOString()).$onUpdateFn(() => new Date().toISOString()),
});