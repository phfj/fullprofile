import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { AuthService } from "@/lib/auth.services";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session_token')?.value;

        if (sessionToken) {
            //Delete session row from database
            await AuthService.logout(sessionToken);
        }

        //clear the cookie client-side
        cookieStore.delete('session_token');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Logout failed' },
            { status: 500 }
        )
    }
}