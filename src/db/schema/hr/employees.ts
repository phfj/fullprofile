import { text, integer, sqliteTable, numeric, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../auth';

export enum Staff_Role {
    health_worker = 'Health Worker',
    supervisor = 'Supervisor',
    director = 'Director',
    accountant = 'Accountant',
    secretary = 'Secretary'
};

export const employeesTable = sqliteTable('employees', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => usersTable.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email').notNull(),
    hireDate: text('hire_date').notNull().$defaultFn(() => new Date().toISOString()),
    status: text('status').$type<'active' | 'inactive'>().notNull(),
    roleTitle: text('role_title').$type<Staff_Role>().notNull(),
    department: text('department').notNull(),
    payType: text('pay_type').notNull(),
    baseRate: numeric('base_rate').notNull()
}, (table) => [
    check('status_check_employees', sql`${table.status} IN ('active', 'inactive')`)
]);