
import * as path from 'path';
import * as dotenv from 'dotenv';

console.log("NODE_ENV=>", process.env.NODE_ENV)

dotenv.config({ path: path.resolve(__dirname, `${process.env.NODE_ENV || 'production'}.env`) })

export default {
    APP_PORT: process.env.APP_PORT,
    APP_HOST: process.env.APP_HOST,
    MONGODB_URI: process.env.MONGODB_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
}
