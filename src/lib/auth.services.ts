//'use server' //tells next.js that this file will be executed on the server (in Node.js runtime), not in the browser

//sqlite auth-service logic
import crypto from 'crypto';
import { db } from '../db/schema';  //Your Drizzle SQLite instance (automatically resolves to '../db/schema/index.ts)
import { usersTable, sessionsTable, NewUser } from '../db/schema/auth';
import { eq } from 'drizzle-orm';
import { BcryptService } from '@/src/lib/bcrypt.service';
import { jwtService } from './jwt.service';
import { generateRandomString } from './generation.service';

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
/**
 * since the db/schemaindex.ts has our schema aggregation and drizzle initialization (contructor), which enables relational queries, 
 * we can directly use the drizzle instance here without initializing it again here (or in any other service file). 
 * For example, to access tables dynamically through the db client using relations
 * const user = await db.query.userTable.findFirst({where: (users, { eq }) => eq)users.email, email})
 * const user is defined here without the [] because we use Relational Query API (db.query.) not the SQL-Like API (db.select().from().where()). 
 * This RQ API fetches a sinle record or return undefined if none is found, unlike the SQL-Like API that would return an empty array.
*/

export const AuthService = {
    //1. SIGN UP (Write)
    //Omit<NewUser>, 'id'> informs TypeScript that the caller does not need to provide the 'id', as the service handles generating and appending the 'id' dynamically.
    signUp: async (newUser: Omit<NewUser, 'id'>): Promise<LoginResponse> => {
        //Find user - SQL-Like API is used here, so, db.select() will return an array, hence [ ] (de-structuring) is used to extract the first element.
        const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, newUser.email))

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
    login: async (body: LoginBody): Promise<LoginResponse> => {
        //Find users
        //const [userExists] = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).execute();

        const userExists = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.email, body.email)
        })
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
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() //set in the future
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
    logout: async (sessionId: string) => {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
        return { success: true };
    }
};
