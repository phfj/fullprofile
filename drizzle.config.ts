import 'dotenv/config'; //reads .env at the root and injects those variables into Node's process.env memory
import { defineConfig } from 'drizzle-kit'; //imports helper function designed specifically to wrap your configuration object (you could export a raw object, but using defineConfig provide your with robust autocompletion and TS type-checking. If you misspell a configuration property, your code editor will immediately warn you.)

export default defineConfig({
    out: './drizzle/migrations', //where to create and maintain your sql migration files
    schema: './src/db/schema/**/*', // (**/* targets everthing inside the folder recursively) tells Drizzle Kit where your TS database schema file (or files) lives (why is matters? Drizzle needs to look at this file to read your tables, columns, and relationships so it can figure out what SQL it needs to generate).
    dialect: 'sqlite', // 'turso' handles serverless sqlite
    dbCredentials: {
        url: process.env.DATABASE_URL!, //locally it is file:local.db, and in a secure cloud it is libsql://
        //authToken: process.env.DATABASE_AUTH_TOKEN, //security passwors/token provided by Turso to authorize your connection. For local file databases (file:local.db), this can be left blank or undefined
    },
});