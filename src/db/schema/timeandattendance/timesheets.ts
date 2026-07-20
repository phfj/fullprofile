import { text, integer, numeric, sqliteTable, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { employeesTable } from '../hr/employees';

export const timesheetsTable = sqliteTable('timesheets', {
    id: text('id').primaryKey(),
    employeeID: text('employee_id').references(() => employeesTable.id).notNull(),
    periodStart: text('period_start').$defaultFn(() => new Date().toISOString()),
    periodEnd: text('period_end').$defaultFn(() => new Date().toISOString()),
    hoursWorked: numeric('hours_worked').notNull(),
    overtimeHours: numeric('overtime_hours').notNull(),
    status: text('status').$type<'submitted' | 'approved'>().notNull()
}, (table) => [
    check('status_check_timesheets', sql`${table.status} IN ('submitted', 'approved')`)
]);