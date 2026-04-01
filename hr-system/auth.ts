import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
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
  databaseHooks: {
    user: {
      create: {
        before: async (nextUser) => {
          const existingAdmin = await db.query.user.findFirst({
            where: eq(schema.user.role, "admin"),
            columns: { id: true },
          });

          if (existingAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Initial admin setup has already been completed.",
            });
          }

          return {
            data: {
              ...nextUser,
              role: "admin",
              isActive: true,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (nextSession) => {
          const account = await db.query.user.findFirst({
            where: eq(schema.user.id, nextSession.userId),
            columns: {
              id: true,
              role: true,
              isActive: true,
            },
          });

          if (!account || account.role !== "admin") {
            throw new APIError("FORBIDDEN", {
              message: "Only admin accounts can access this system.",
            });
          }

          if (account.isActive === false) {
            throw new APIError("FORBIDDEN", {
              message: "This admin account has been deactivated.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
