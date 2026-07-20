//proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

//The function is now explicitly called proxy
export function proxy(request: NextRequest) {
    const token = request.cookies.get('session_token');

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

//Matcher configuration rules remain the same
export const config = {
    matcher: '/dashboard/:path*',
}