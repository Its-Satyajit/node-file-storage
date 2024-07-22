import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/config';
import { UserRole } from '../types/roles';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export const authorizeRole = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).send('Forbidden');
    }
    next();
};
