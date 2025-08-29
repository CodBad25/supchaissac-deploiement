const { Client } = require('pg');
require('dotenv').config();

async function removeProblematicUsers() {
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

    // Supprimer les 3 enseignants problématiques
    const usersToRemove = [
      'teacher2@example.com',  // Marie Petit
      'teacher3@example.com',  // Martin Dubois  
      'teacher4@example.com'   // Philippe Garcia
    ];

    console.log('\n🗑️ Suppression des enseignants problématiques...');
    
    for (const username of usersToRemove) {
      const result = await client.query('DELETE FROM users WHERE username = $1', [username]);
      if (result.rowCount > 0) {
        console.log(`✅ ${username} supprimé`);
      } else {
        console.log(`⚠️ ${username} non trouvé`);
      }
    }

    // Afficher les utilisateurs finaux
    console.log('\n👥 Utilisateurs finaux (4 qui fonctionnent) :');
    const finalUsers = await client.query('SELECT id, username, name, role, in_pacte FROM users ORDER BY id;');
    
    finalUsers.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.name} (${user.username}) - ${user.role} - Pacte: ${user.in_pacte ? 'Oui' : 'Non'}`);
    });

    console.log('\n🎯 Interface simplifiée : 4 utilisateurs qui fonctionnent !');
    console.log('📋 Sophie Martin + Secrétaire + Direction + Admin');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

removeProblematicUsers();
