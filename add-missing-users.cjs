const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addMissingUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Connexion à Neon...');
    await client.connect();
    console.log('✅ Connecté à Neon !');

    // Mot de passe par défaut pour tous les utilisateurs de test
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Utilisateurs manquants à ajouter
    const missingUsers = [
      {
        username: 'teacher2@example.com',
        name: 'Marie Petit',
        role: 'TEACHER',
        initials: 'MP',
        in_pacte: true
      },
      {
        username: 'teacher3@example.com', 
        name: 'Martin Dubois',
        role: 'TEACHER',
        initials: 'MD',
        in_pacte: false
      },
      {
        username: 'teacher4@example.com',
        name: 'Philippe Garcia', 
        role: 'TEACHER',
        initials: 'PG',
        in_pacte: true
      }
    ];

    console.log('\n➕ Ajout des utilisateurs manquants...');

    for (const user of missingUsers) {
      try {
        await client.query(`
          INSERT INTO users (username, password, name, role, initials, in_pacte, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          user.username,
          hashedPassword,
          user.name,
          user.role,
          user.initials,
          user.in_pacte
        ]);
        
        console.log(`✅ ${user.name} (${user.username}) ajouté - Pacte: ${user.in_pacte ? 'Oui' : 'Non'}`);
      } catch (error) {
        console.log(`❌ Erreur pour ${user.name}: ${error.message}`);
      }
    }

    // Afficher tous les utilisateurs finaux
    console.log('\n👥 Utilisateurs finaux :');
    const finalUsers = await client.query('SELECT id, username, name, role, in_pacte FROM users ORDER BY id;');
    
    finalUsers.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.name} (${user.username}) - ${user.role} - Pacte: ${user.in_pacte ? 'Oui' : 'Non'}`);
    });

    console.log('\n🎯 Tous les utilisateurs sont maintenant présents !');
    console.log('📋 Mot de passe pour tous : password123');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

addMissingUsers();
