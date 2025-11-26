import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function resetDatabase() {
  console.log("🔄 Resetting production database...");

  try {
    // Get all table names (excluding system tables)
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%'
    `);

    const tables = tablesResult.rows.map((row) => row.name as string);

    if (tables.length === 0) {
      console.log("✅ Database is already empty.");
      return;
    }

    console.log(`Found ${tables.length} tables: ${tables.join(", ")}`);

    // Drop all tables
    for (const table of tables) {
      console.log(`  Dropping table: ${table}`);
      await client.execute(`DROP TABLE IF EXISTS "${table}"`);
    }

    // Drop drizzle migrations table if it exists
    await client.execute(`DROP TABLE IF EXISTS "__drizzle_migrations"`);
    console.log("  Dropped __drizzle_migrations table");

    console.log("✅ Database reset complete!");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

resetDatabase();
