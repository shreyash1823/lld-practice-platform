import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing Turso environment variables");
}

const client = createClient({
  url,
  authToken,
});

let sql = await readFile("migration.sql", "utf8");

// Remove UTF-8 BOM if present
sql = sql.replace(/^\uFEFF/, "");

// Remove SQL comment lines BEFORE splitting into statements
sql = sql.replace(/^\s*--.*$/gm, "");

const statements = sql
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

console.log(`Found ${statements.length} statements.`);
console.log("Applying migration to Turso...");

for (let i = 0; i < statements.length; i++) {
  console.log(`Applying statement ${i + 1}/${statements.length}...`);

  try {
    await client.execute(statements[i]);
  } catch (error) {
    console.error(`❌ Failed on statement ${i + 1}`);
    console.error(statements[i]);
    throw error;
  }
}

console.log("✅ Turso schema created successfully!");

client.close();
