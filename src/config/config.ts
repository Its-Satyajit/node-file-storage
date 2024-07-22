import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3000,
    db: {
        host: (process.env.DB_HOST as string) || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        database: process.env.DB_DATABASE as string,
    },
    jwt: {
        secret: (process.env.JWT_SECRET as string) || 'default_secret_key', // Use environment variable
    },
};
