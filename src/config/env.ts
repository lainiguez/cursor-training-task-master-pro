import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    API_KEY: process.env.API_KEY || 'default-api-key',
    DATABASE_URL: process.env.DATABASE_URL,
};
