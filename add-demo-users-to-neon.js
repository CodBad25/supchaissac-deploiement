import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

console.log('🎭 AJOUT DES UTILISATEURS DEMO À NEON');
console.log('====================================');

const demoUsers = [
  {
    username: 'teacher1@example.com',
    password: 'password123',
    name: 'Sophie MARTIN',
    role: 'TEACHER',
    in_pacte: false
  },
  {
    username: 'teacher2@example.com',
    password: 'password123',
    name: 'Marie PETIT',
    role: 'TEACHER',
    in_pacte: true
  },
  {
    username: 'teacher3@example.com',
    password: 'password123',
    name: 'Martin DUBOIS',
    role: 'TEACHER',
    in_pacte: false
  },
  {
    username: 'teacher4@example.com',
    password: 'password123',
    name: 'Philippe GARCIA',
    role: 'TEACHER',
    in_pacte: true
  },
  {
    username: 'secretary@example.com',
    password: 'password123',
    name: 'Laure MARTIN',
    role: 'SECRETARY',
    in_pacte: false
  },
  {
    username: 'principal@example.com',
    password: 'password123',
    name: 'Jean DUPONT',
    role: 'PRINCIPAL',
    in_pacte: false
  },
  {
    username: 'admin@example.com',
    password: 'password123',
    name: 'Admin',
    role: 'ADMIN',
    in_pacte: false
  },
  {
    username: 'admin.dev@supchaissac.local',
    password: '$2b$12$51yRwEwX4gtjTEoElpA6b.tBoFAhqUo1SWHQmKP0PPz1iaYpby9OG',
    name: 'Admin Développement',
    role: 'ADMIN',
    in_pacte: false
  }
];

try {
  console.log('📊 Comptage des utilisateurs avant ajout...');
  const countBefore = await sql`SELECT COUNT(*) as count FROM users`;
  console.log(`👥 Utilisateurs existants: ${countBefore[0].count}`);

  console.log('\n🔄 Ajout des utilisateurs demo...');
  let added = 0;
  let skipped = 0;

  for (const user of demoUsers) {
    try {
      await sql`
        INSERT INTO users (username, password, name, role, in_pacte) 
        VALUES (${user.username}, ${user.password}, ${user.name}, ${user.role}, ${user.in_pacte})
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          in_pacte = EXCLUDED.in_pacte
      `;
      console.log(`  ✅ ${user.name} (${user.username})`);
      added++;
    } catch (error) {
      console.log(`  ⚠️ ${user.name} (${user.username}) - déjà existant`);
      skipped++;
    }
  }

  console.log('\n📊 Comptage des utilisateurs après ajout...');
  const countAfter = await sql`SELECT COUNT(*) as count FROM users`;
  console.log(`👥 Utilisateurs total: ${countAfter[0].count}`);

  console.log(`\n✅ Terminé ! ${added} ajoutés, ${skipped} mis à jour`);

} catch (error) {
  console.error('❌ Erreur:', error);
} finally {
  await sql.end();
}
