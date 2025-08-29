const { Client } = require('pg');
require('dotenv').config();

async function cleanNeonUsers() {
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

    // Afficher les utilisateurs actuels
    console.log('\n👥 Utilisateurs AVANT nettoyage :');
    const beforeUsers = await client.query('SELECT id, username, role FROM users ORDER BY id;');
    beforeUsers.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.username} (${user.role})`);
    });

    // Garder seulement les 4 utilisateurs qui fonctionnent
    const usersToKeep = [
      'teacher1@example.com',  // Sophie Martin
      'secretary@example.com', // Secrétaire
      'principal@example.com', // Direction
      'admin@example.com'      // Admin
    ];

    console.log('\n🧹 Suppression des utilisateurs défaillants...');
    
    // Supprimer tous les utilisateurs SAUF ceux à garder
    const deleteQuery = `
      DELETE FROM users 
      WHERE username NOT IN ($1, $2, $3, $4)
    `;
    
    const result = await client.query(deleteQuery, usersToKeep);
    console.log(`✅ ${result.rowCount} utilisateurs supprimés`);

    // Mettre à jour teacher1 pour qu'il s'appelle Sophie Martin
    console.log('\n✏️ Mise à jour de Sophie Martin...');
    await client.query(`
      UPDATE users 
      SET name = 'Sophie Martin',
          initials = 'SM'
      WHERE username = 'teacher1@example.com'
    `);
    console.log('✅ Sophie Martin mise à jour');

    // Afficher les utilisateurs finaux
    console.log('\n👥 Utilisateurs APRÈS nettoyage :');
    const afterUsers = await client.query('SELECT id, username, name, role, in_pacte FROM users ORDER BY id;');
    
    if (afterUsers.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé !');
    } else {
      console.log(`✅ ${afterUsers.rows.length} utilisateurs restants :`);
      afterUsers.rows.forEach(user => {
        console.log(`  ${user.id}. ${user.name} (${user.username}) - ${user.role} - Pacte: ${user.in_pacte ? 'Oui' : 'Non'}`);
      });
    }

    console.log('\n🎯 Nettoyage terminé ! Les 4 utilisateurs fonctionnels sont conservés.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

cleanNeonUsers();
