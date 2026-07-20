import jwt from 'jsonwebtoken';


//jwt.service.ts:
/**
 * JWT (token generation)
 * - issues a secure, stateless access token to the client once they successfully log in, letting them access wihtout re-entering credentials
 * - it is an authentication and authorization mechanism
 * - a jwt contains info about the client's identity and permissions (privileges) of the client (usually the user's role)
 * We use JWT for stateless session validation, token generation, and token expiration.
 * JWT = Header + Payload + Signature
 * Header: typically contains the type of token (JWT) and the signing algorithm (HS256)
 * Payload: contains data (called claims). In our case it includes the user's ID and an expiry time (exp).
 * Signature: prevents tampering. It is created by signing the encoded header and payload with a secret key
 */
interface JwtPayload {
    userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET //access secret
const REFRESH_SECRET = process.env.REFRESH_SECRET//refresh secret

//access token
export const jwtService = {
    //15-min token sent in reponse body (stored in client memory)  (for API authorization)
    /**generationToken() function explanation
     * (payload: JwtPayload): parameter of the arrow function:
     * - payload: name of the input argument
     * - : JwtPayload: A TypeScript annotation (must match the JwtPayload interface { userId: string })
     * : string: string is the return type annotation (function must return a value of type string)
    */
    generationToken: (payload: JwtPayload): string => {
        return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '15m' });
    },

    //verify token
    /**
     * jwt.verify is actually running synchronously because it is not being passed a callback function.
     *  However, wrapping it in async function that returns a Promise<JwtPayload> || null> is a common design for several reasons:
     * 1. Future-proofing for revocation / Database Checks
     *  - right now, token is verified mathematically using the signature
     *  - in real-world applications, you often need to perform asynchronous operations during token verficiation, such as:
     *    - checking if a token has been blacklisted (e.g. in a Redis database after a user log out)
     *    - verify if the user's account is still active or suspended by quering the database
     *    - Fetching public keys from an external server (JWKS) if using assymetric encryption (like RS256)
     * By making verifyToken asynchornous from the start, you can easily add these database queries or external requests later 
     *  without having to change the function signature or rewrite every caller (like middleware) to use await.
     *
     * 2. Consistency with Middleware and Other Async Operations
     *  - Authentication middlware in frameworks (like Express or Next.js) is almost always asynchronous
     *     because it deals with database queries or net requests. Keeping verifyToken asynchronous allows it to fit seamlessly into async.await chains
     *         //e.g. in auth.middleware.ts
     *         const payload = await jwtService.verify(token);
     * 
     * 3. Non-blocking error handling
     *  - Returning a promise standardizes error handling.
     *  - If any unexpected asynchronous error occurs, it rejects the promise, which can be cleanly caught with standard try/catch block in callers.
     * */
    verifyToken: async (token: string): Promise<JwtPayload | null> => {
        try {
            return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
        } catch (err) {
            console.error("JWT verification failed:", err);
            return null;
        }
    },

    //7-day referesh token sent via HTTP-cookie (to issue new access token when they expire)
    //this is used to issue a new short-lived token in the background
    generateRefreshToken: (payload: JwtPayload): string => {
        return jwt.sign(payload, REFRESH_SECRET as string, { expiresIn: '7d' });
    },

    //verify refresh token
    verifyRefreshToken: async (token: string): Promise<JwtPayload | null> => {
        try {
            return jwt.verify(token, REFRESH_SECRET as string) as JwtPayload;
        } catch (err) {
            console.error("JWT verification failed:", err);
            return null;
        }
    }
}