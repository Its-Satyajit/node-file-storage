import Postgres from 'postgres';
import { config } from '../config/config';

const sql = Postgres({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: process.env.DB_SSL === 'true' ? true : false, // Use SSL if specified
});

export { sql };
