import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { requireRole } from "@/lib/auth";
import { Roles } from "@/db/schema/auth";
import { db } from '@/db/schema';
import { employeesTable } from "@/db/schema/hr/employees";
import { eq } from 'drizzle-orm';
import { response } from "express";

interface RouteContext {
    params: Promise<{ id: string }>; //params represents the dynamic segments in our URL path (e.g. if your url is /users/123, the params object will hold id: '123')
}

/**
 * 
 * GET /api/employees[id]
 * Fetch a single employee by ID (Admin, Developer, or Staff) 
 */

export async function GET(request: NextRequest, context: RouteContext) {
    const auth = await requireRole([Roles.Admin, Roles.Developer, Roles.Staff]);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { id } = await context.params;

        const [employee] = await db
            .select()
            .from(employeesTable)
            .where(eq(employeesTable.id, id));

        if (!employee) {
            return NextResponse.json(
                { success: false, message: 'Employee not found.' },
                { status: 404 } //Not Found
            )
        };

        return NextResponse.json({
            success: true,
            data: employee
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 } //Internal server error
        );
    }
}

/**
 * PUT /api/employees/[id]
 * Update an employee record (Restricted to Admin or Developer)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole([Roles.Admin, Roles.Developer]);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { id } = await context.params;
        const body = await request.json();

        //Verify existence
        const [existing] = await db
            .select()
            .from(employeesTable)
            .where(eq(employeesTable.id, id));

        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Employee not found.' },
                { status: 404 } //Not Found
            )
        }

        //Update fields if provided
        await db
            .update(employeesTable)
            .set({
                firstName: body.firstName ?? existing.firstName,
                lastName: body.lastName ?? existing.lastName,
                email: body.email ?? existing.email,
                status: body.status ?? existing.status,
                roleTitle: body.roleTitle ?? existing.roleTitle,
                department: body.department ?? existing.department,
                baseRate: body.baseRate !== undefined ? String(body.baseRate) :
                    existing.baseRate,
            })
            .where((eq(employeesTable.id, id)));

        const [updatedEmployee] = await db
            .select()
            .from(employeesTable)
            .where(eq(employeesTable.id, id));

        return NextResponse.json({
            success: true,
            message: 'Employee udpated successfully',
            data: updatedEmployee,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update employee.' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/employees/[id]
 * Delete an employee record (Restricted to Admin or Developer)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole([Roles.Admin, Roles.Developer]);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { id } = await context.params;
        //const body = await request.json();

        //verify existence
        const [existing] = await db
            .select()
            .from(employeesTable)
            .where(eq(employeesTable.id, id));

        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Employee not found.' },
                { status: 404 }
            )
        }

        //delete employee row
        await db.delete(employeesTable).where(eq(employeesTable.id, id));

        return NextResponse.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete employee' },
            { status: 500 }
        );
    }
}