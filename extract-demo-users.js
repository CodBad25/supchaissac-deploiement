import Database from "better-sqlite3";
import fs from 'fs';

const db = new Database('./data/supchaissac.db');

console.log('🔍 EXTRACTION DES UTILISATEURS DEMO POUR NEON');
console.log('==============================================');

// Extraire tous les utilisateurs
const users = db.prepare('SELECT * FROM users').all();
console.log(`📊 ${users.length} utilisateurs trouvés dans SQLite`);

// Créer le script SQL pour Neon
let sqlScript = `-- 🎭 UTILISATEURS DEMO POUR TESTS (à ajouter à Neon)
-- Générés le ${new Date().toISOString()}
-- Mot de passe pour tous: password123

`;

users.forEach(user => {
  sqlScript += `INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  '${user.username}',
  '${user.password}',
  '${user.name}',
  '${user.role}',
  ${user.in_pacte ? 'true' : 'false'}
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

`;
});

// Sauvegarder le script
fs.writeFileSync('./demo-users-for-neon.sql', sqlScript);

console.log('\n✅ Script SQL généré: demo-users-for-neon.sql');
console.log('\n📋 Utilisateurs à ajouter:');
users.forEach(user => {
  console.log(`  • ${user.name} (${user.username}) - ${user.role}`);
});

db.close();
