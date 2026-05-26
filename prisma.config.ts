import { config } from "dotenv";
// Explicitly point to the server directory where the .env is hiding
config({ path: "./server/.env" }); 

import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});