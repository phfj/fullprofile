import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth.services';
import { Roles } from '@/db/schema/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password, role } = body;

        //Basic validation
        if (!email || !password || !firstName) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: firstName, email, password' },
                { status: 400 }
            );
        }

        //Call AuthService to create the user record
        const result = await AuthService.signUp({
            firstName,
            lastName: lastName || null,
            email,
            passwordHash: password,
            role: role || Roles.Guest,
        });

        return NextResponse.json(
            { success: true, message: result.message },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Registraition Failed' },
            { status: 400 }
        )
    }



}