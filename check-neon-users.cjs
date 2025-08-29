const { Client } = require('pg');
require('dotenv').config();

async function checkNeonUsers() {
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

    // Vérifier les tables existantes
    console.log('\n📋 Tables existantes :');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Vérifier les utilisateurs
    console.log('\n👥 Utilisateurs dans la base :');
    try {
      const users = await client.query('SELECT id, username, role, in_pacte FROM users ORDER BY id;');
      
      if (users.rows.length === 0) {
        console.log('❌ Aucun utilisateur trouvé !');
      } else {
        console.log(`✅ ${users.rows.length} utilisateurs trouvés :`);
        users.rows.forEach(user => {
          console.log(`  ${user.id}. ${user.username} (${user.role}) - Pacte: ${user.in_pacte ? 'Oui' : 'Non'}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture des utilisateurs:', error.message);
    }

    // Vérifier la structure de la table users
    console.log('\n🏗️ Structure de la table users :');
    try {
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } catch (error) {
      console.log('❌ Erreur lors de la lecture de la structure:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

checkNeonUsers();
