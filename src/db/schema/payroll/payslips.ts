import { text, integer, numeric, sqliteTable, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { employeesTable } from '../hr/employees';

export const payslipsTable = sqliteTable('payslips', {
    id: text('id').primaryKey(),
    employeeID: text('employee_id').references(() => employeesTable.id, { onDelete: "cascade" }).notNull(),
    periodStart: text('period_start').$defaultFn(() => new Date().toISOString()).notNull(),
    periodEnd: text('period_end').$defaultFn(() => new Date().toISOString()).notNull(),
    paymentDate: text('payment_date').$defaultFn(() => new Date().toISOString()).notNull(),
    grossPay: numeric('gross_pay').notNull(),
    totalDeductions: numeric('total_deductions').notNull(),
    netPay: text('net_pay').notNull(),
    status: text('status').$type<'draft' | 'paid' | 'failed'>().notNull(),
}, (table) => [
    check('status_check_payslips', sql`${table.status} IN ('draft', 'paid', 'failed')`),
]);