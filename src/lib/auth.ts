//Create helper utilities to get the current authenticated user session inside Route Handlers
// (route handler is located at app/api/auth/me/route.ts):

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { sessionsTable, usersTable, User, Roles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

/**
 * Retrieves the current user from the database based on the 'session_token' cookie.
 */
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies(); //cookie is stored on client
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
        return null;
    }

    //Query the session details
    //take value of session stored in cookie and see if it is equal (exists) inside the server db
    const session = await db.query.sessionsTable.findFirst({
        where: (sessions, { eq }) => eq(sessions.id, sessionToken),
    });

    if (!session) {
        return null;
    }

    //validate session expiration date
    //if the session expiry date  
    if (new Date(session.expiresAt) < new Date()) {
        //Clean up the expired session asynchronously
        db.delete(sessionsTable).where(eq(sessionsTable.id, sessionToken)).catch(console.error);
        return null;
    }

    //Query the associated user record
    const user = await db.query.usersTable.findFirst({
        where: (users, { eq }) => eq(users.id, session.userId),
    });

    return user || null;//**//**//
}

/**
 * Validates that the current user has one of the allowed roles.
 * Returns either:
 *  - { authorized: true, user: User }
 *  - { authorized: false, response: NextResponse }
 */

export async function requireRole(allowedRoles: Roles[]) {
    const user = await getCurrentUser();

    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            ),
        };
    }

    if (!allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Forbidden: Insufficient provileges' },
                { status: 403 }
            )
        };
    }

    return { authorized: true, user };
}