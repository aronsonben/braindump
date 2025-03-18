import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres'
import * as dotenv from 'dotenv';
import * as schema from "@shared/schema";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// const allUsers = await db.select().from(users);