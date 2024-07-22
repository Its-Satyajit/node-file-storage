import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/roles';
import { config } from '../config/config';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Ensure user is of the correct type
        next();
    });
};

export const authorizeRole = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).send('Forbidden');
    }
    next();
};
