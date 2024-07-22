import { UserRole } from './roles';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                role: UserRole;
            };
        }
    }
}
