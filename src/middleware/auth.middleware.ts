//token verification logic
import { Request, Response, NextFunction } from 'express';
import { cryptoUtils } from '../lib/crypto';

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Athentication required. Please provide a Bearer token.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        //Clean & Decoupled: Using the utility method we just exposed!
        const decoded = cryptoUtils.verifyToken(token);

        req.userId = decoded.userId;
        next(); //move to target route
    } catch (error) {
        return res.status(403).json({
            error: 'Access denied. Token is invalid or has expired.'
        });
    }
}
