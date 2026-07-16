import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//*** Ensure to use native cryto.randomUUID() at runtime instead of pulling in bulky third-party UUID packages

/**never store plain text passwords.
 * The below provides a secure and efficient full-stack authentication flow
 * brypt (password hashing) 
 * - securely hashes and verifies password in your db
 * - desgined to be computationally intensive and slow, making it more resistent to brute-force attacks
 * jwt (token generation) 
 * - issues a secure, stateless access token to the client one they successfully log in, letting them access protected endpoints without re-enteting credentials
 * - it is an authentication and authorization mechanism
 * - a jwt token contains info. about the client's identity and priveleges.
 * - the client passes the jwt to the server to prove their identity and priveleges
 * **/
//salt is a random string of data added to user's password before it is hashed
const SALT_ROUNDS = 12; //how many tiems a hashing process is repeated (it slows down brute-force attack)
const JWT_SECRET = process.env.JWT_SECRET || 'cUL0bywVOs/5dokGdWlx/T+6FX5DG2Zr822wTfzSw34='; //access secret
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'nZoVlBErobJSda3uKauehuVTrYO24hdcl8/YbbxEzNs=' //refresh secret


export const cryptoUtils = {
    //hash the password with bcrypt
    //since Hashing with bcrypt is a computationallly heavy, CPU-intensive process, to prevent blocking the main execution thread, we use async/await with node.js' event-loop.
    //bcrypt.hash runs asynchronously and returns a promise
    hashPassword: async (password: string): Promise<string> => {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    //compare entered password with hashpassword
    comparePassword: async (password: string, hash: string): Promise<boolean> => {
        return bcrypt.compare(password, hash);
    },

    //15-min  token sent in response body (stored in client memory) (for API authorization)
    generateToken: (payload: { userId: string }): string => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }) //short-lived access token
    },

    //verify token
    verifyToken: (token: string): { userId: string } => {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    },

    //7-day token sent via HTTP-only cookie (to issue new access token when they expire)
    //this is used to issue a new short-lived token in the background
    generateRefreshToken: (payload: { userId: string }): string => {
        return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
    },

    //verify the refresh token
    verifyRefreshToken: (token: string): { userId: string } => {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string };
    }
}

//for environment (.env) variables to read properly, you can run the below to ensure things like process.env.JWT_SECRET successfully reads from your .env file anywhere
// //npx tsx --env-file=.env index.ts
//this will flag at runtime