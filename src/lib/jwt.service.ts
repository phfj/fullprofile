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
    generationToken: (payload: JwtPayload): string => {
        return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '15m' });
    },

    //verify token
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