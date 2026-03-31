import { sql } from "drizzle-orm";
import { db } from "./lib/db";

async function main() {
  const result = await db.execute(sql`select 1`);
  console.log("Database connection OK", result);
}

void main();
