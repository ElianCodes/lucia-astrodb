import { defineConfig } from 'astro/config';
import db from "@astrojs/db";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [db()],
  output: "server",
  adapter: vercel()
});