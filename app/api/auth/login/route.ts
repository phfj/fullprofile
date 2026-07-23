import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth.services";
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        //Basic Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password required' },
                { status: 400 }
            );
        }

        //Validate user & create session ID in database
        const result = await AuthService.login({ email, password });

        if (!result.sessionId) {
            return NextResponse.json(
                { success: false, message: 'Failed to create session' },
                { status: 500 }
            );
        }

        //Set the HTTP-only cookie on the client response
        const cookieStore = await cookies();
        cookieStore.set('session_token', result.sessionId, {
            httpOnly: true, //prevents client-side scripts (document.cookie) from reading the token, protecting againts XSS.
            secure: process.env.NODE_ENV === 'production', //forcing cookie to transmit only over encrypted HTTPS in production (true in production but not in localhost (false))
            sameSite: 'lax', //blocks the cookie on cross-site subrequests (like images or api fetches) but allows it when a user clicks a link to navigate to your site
            path: "/", //makes the cookie accessible across your entire root and all of its sub-directories
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), //30days
        });

        return NextResponse.json({
            success: true,
            message: result.message,
            user: result.user,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Invalid email or password' },
            { status: 401 }
        );
    }
}