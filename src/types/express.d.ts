import { UserRole } from './roles'; // Adjust the path according to your project structure

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
