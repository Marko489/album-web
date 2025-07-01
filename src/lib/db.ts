import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// For API routes
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const client = await pool.connect();
  try {
    return await client.query({
      text: strings.join('?'),
      values
    });
  } finally {
    client.release();
  }
}

// For Server Components
export default pool;