import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = false;

export const db = drizzle({ connection: databaseUrl, schema, ws });
