import { NextFunction, Request, Response } from 'express';
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

export interface AuthRequest extends Request {
    user?: any;
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
        req.user = {
            id: 1,
            session: '178326472478'
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}