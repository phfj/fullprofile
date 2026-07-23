import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { Roles } from '@/db/schema/auth';
import { db } from '@/db/schema';
import { employeesTable } from "@/db/schema/hr/employees";
import { eq } from 'drizzle-orm';
import cryto from 'crypto';

/**
 * GET /api/employees
 * List all employess (Restricted to Admin, Developer, or Staff)
 */
export async function GET(request: NextRequest) {
    //1. Authenticate & authorize
    const auth = await requireRole([Roles.Admin, Roles.Developer, Roles.Staff]);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        //2. Query all employees
        const employees = await db.select().from(employeesTable);

        return NextResponse.json({
            success: true,
            data: employees,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Faled to fetch employees' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/employees
 * Create a new employee record (Restrictied to Admin or Developer)
 */
export async function POST(request: NextRequest) {
    //1. Authenticate & authorize
    const auth = await requireRole([Roles.Developer, Roles.Admin]);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const body = await request.json();
        const { userId, firstName, lastName, email, roleTitle, department, payType, baseRate, status } = body;

        //Basic Validation
        if (!firstName || !email || !roleTitle || !department || !payType || baseRate === undefined) {
            return NextResponse.json(
                { success: false, message: 'Missing required employee fields' },
                { status: 400 }
            );
        }

        const newEmployeeId = crypto.randomUUID();

        //Insert new employee
        await db.insert(employeesTable).values({
            id: newEmployeeId,
            userId: userId || null,
            firstName,
            lastName: lastName || null,
            email,
            hireDate: new Date().toISOString(),
            status: status || 'active',
            roleTitle,
            department,
            payType,
            baseRate: String(baseRate),
        });

        //Fetch created employee to return in response
        const [createdEmployee] = await db
            .select()
            .from(employeesTable)
            .where(eq(employeesTable.id, newEmployeeId));

        return NextResponse.json(
            {
                success: true,
                message: 'Employee created successfully',
                data: createdEmployee,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create employee' },
            { status: 500 }
        );
    }
}