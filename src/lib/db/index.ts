import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }
  const sql = neon(databaseUrl, {
    fetchOptions: { cache: "no-store" },
  });
  return drizzle(sql, { schema });
}

export const db = getDb();
export type DB = typeof db;
