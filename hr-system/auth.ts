import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./db/schema/auth";
import { db } from "./lib/db";

const baseURL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL;

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: {
        type: ["admin", "employee"],
        required: false,
        defaultValue: "admin",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
