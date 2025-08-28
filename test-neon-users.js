import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function testNeonUsers() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const users = await sql`SELECT id, username, name, role FROM users LIMIT 5`;
    console.log('👥 Utilisateurs Neon:', users);
    
    const sessions = await sql`SELECT id, date, subject, status FROM sessions LIMIT 3`;
    console.log('📅 Sessions Neon:', sessions);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testNeonUsers();
