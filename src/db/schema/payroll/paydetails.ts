import { text, numeric, sqliteTable, check } from 'drizzle-orm/sqlite-core';
import { payslipsTable } from './payslips';
import { sql } from 'drizzle-orm';
import { centsCurrency } from '@/db/types';

export enum EARNINGS_DESC {
    Base_Salary = "Base Salary",
    Allowances = "Allowances",
    Overtime = "Overtime",
    Bonuses = "Bonuses",
    Gross_Earning = "Gross Earning"
};

export enum DEDUCTIONS_DESC {
    FNPF = "FNPF",
    PAYE = "PAYE",
    SRT = "SRT", //Social Responsibility Tax
    AAR = "AAR", //Authorized Advanced Recoveries (Repayment for company loans or salary advances)
    NET_EARNINGS = "Net Earnings" //The exact tabke home pay after all deductions have been processed
};

export enum DESCRIPTION {
    EARNINGS_DESC,
    DEDUCTIONS_DESC
};

export const paydetailsTable = sqliteTable('paydetails', {
    id: text('id').primaryKey(),
    payslipId: text('payslip_id').references(() => payslipsTable.id, { onDelete: "cascade" }).notNull(),
    lineType: text('line_type').$type<'earning' | 'deduction'>().notNull(),
    description: text('description').$type<DESCRIPTION>().notNull(),
    amount: centsCurrency('amount').notNull()
}, (table) => [
    check('positive_amount_check', sql`${table.amount} > 0`)
]);
/**
 * since types.ts for centsCurrency is defined and used, to use seamlessly in your app:
 * //1. Inserting Data
 * //You pass a normal floating-point dollar amount
 * //Drizzle automatically converts this and writed "4999" inot the SQLite file
 * await db.insert(amount).values({
 *  price: 49.99
 * });
 * 
 * 2. Querying Data
 * //Drizzle automatically converts teh araw database "4999" back into a readable JS number.
 * const result = await db.select().fom(amount);
 * console.log(result[0].amount);
 * //Output: 49.99 (Type is recognized natively as 'number')
 */