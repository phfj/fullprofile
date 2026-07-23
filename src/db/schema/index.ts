import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as auth from './auth';
import * as booking from './booking';
import * as clinic from './clinic';
import * as employees from './hr/employees';
import * as paydetails from './payroll/paydetails';
import * as payslips from './payroll/payslips';
import * as timesheets from './timeandattendance/timesheets';

export const schema = {
    ...auth,
    ...booking,
    ...clinic,
    ...employees,
    ...paydetails,
    ...payslips,
    ...timesheets,
};

const dbFileName = process.env.DATABASE_URL;
if (!dbFileName) {
    throw new Error("DATABASE_URL environment is not defined.");
}

// Initialize drizzle with our schema attached for type-safe relationship queries
export const db = drizzle(dbFileName, { schema });

/**
 * Purpose of index.ts in a Drizzle ORM setup
 * 1. Schema Aggregation (Single Entry Point)
 * -- instead of importing auth, booking, clinic etc separately in every file, we import them here and export them from here
 * 2. Enables Relational Queries
 * -- by passing this combined schema object to the drizzle constructor (unlocks Relational Queries API), we allow drizzle to understand the relationships between the tables and perform type-safe joins and other relational queries
 * 3. Drizzle Configuration
 * -- initializes the drizzle ORM with the database connection and schema
 * -- initialization is done in one place instead of initializing connection in multiple parts of the application
 * 3. Environment Variable Management
 * -- reads the database connection string from the environment variables
 */