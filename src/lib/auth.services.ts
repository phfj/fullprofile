//sqlite auth-service logic
import crypto from 'crypto';
import { db } from '../db/schema';  //Your Drizzle SQLite instance
import { usersTable, sessionsTable, NewUser } from '../db/schema/auth';
import { eq } from 'drizzle-orm';
import { BcryptService } from '@/src/lib/bcrypt.service';
import { jwtService } from './jwt.service';
import { generateRandomString } from './generation.service';
import 'dotenv/config';

interface LoginBody {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    user?: {
        id: string;
        email: string;
        name?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    sessionId?: string;
}

export const AuthService = {
    //1. SIGN UP (Write)
    async signUp(newUser: NewUser): Promise<LoginResponse> {
        //Find user
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, newUser.email));

        //check if user already exists
        if (existingUser) {
            throw new Error('Email already registered');
        }

        //Hash password and save
        const passwordHash = await BcryptService.hashPassword(newUser.passwordHash);
        //newUser.confirmationCode = generateRandomString(6).toUpperCase();
        const confirmationCode = generateRandomString(6).toUpperCase();
        const userId = crypto.randomUUID(); //id is generated manually in js (not by db) - *id type is 'text'

        //create user in DB
        await db.insert(usersTable).values({
            ...newUser,
            passwordHash,
            id: userId,
            confirmationCode,
            isEmailVerified: false //always false on signup for security
        });

        return { message: "User created successfully. Please check your email for a verificaiton code." };
    },

    //2. LOGIN (Read & Verify)
    async login(body: LoginBody): Promise<LoginResponse> {
        //Find users
        const [userExists] = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).execute();

        //check if user exists
        if (!userExists) {
            throw new Error('Invalid email or password');
        }

        //Verify password
        const isPasswordValid = await BcryptService.comparePassword(body.password, userExists.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        //Create a persistent session
        //For SQLite, a standard high-entropy random string works beautifully as a session key
        const sessionId = crypto.randomBytes(32).toString('hex');
        //const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toString(); //30days

        await db.insert(sessionsTable).values({
            id: sessionId,
            userId: userExists.id,
            createdAt: new Date().toISOString(),
            expiresAt: new Date().toISOString()
        });

        //Generate short-lived JWT for fast stateless API authentication
        const accessToken = jwtService.generationToken({ userId: userExists.id });

        //referesh token
        const refreshToken = jwtService.generateRefreshToken({ userId: userExists.id });

        return {
            message: "Welcome to my website",
            user: {
                id: userExists.id,
                email: userExists.email,
                name: `${userExists.firstName} ${userExists.lastName ??
                    ''}`.trim()
            },
            sessionId // Handles by Next.js Server Action/Route Handler to set cookie
        }
        //we are using stateful sessions - user session data is stored in a database
        //not using stateless JWT (relying on tokens carried by the client, where all necesary user data in encoded directly inside the token)
    },

    //3. LOGOUT (Revocation)
    async logout(sessionId: string) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
        return { success: true };
    }
};
