#!/usr/bin/env node

// 🧹 Script pour supprimer tous les utilisateurs corrompus et garder seulement les utilisateurs de test propres

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function resetToCleanUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🧹 Nettoyage complet - Suppression des utilisateurs corrompus...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Lister tous les utilisateurs
    const allUsers = await sql`SELECT id, username, name, role FROM users ORDER BY id`;
    console.log(`\n📊 ${allUsers.length} utilisateurs trouvés`);
    
    // Identifier les utilisateurs de test propres (les 7 premiers normalement)
    const cleanUsers = [
      'teacher1@example.com',
      'teacher2@example.com', 
      'teacher3@example.com',
      'teacher4@example.com',
      'secretary@example.com',
      'principal@example.com',
      'admin@example.com'
    ];
    
    // Identifier les utilisateurs à supprimer
    const usersToDelete = allUsers.filter(user => !cleanUsers.includes(user.username));
    
    console.log(`\n🗑️ ${usersToDelete.length} utilisateurs corrompus à supprimer:`);
    usersToDelete.slice(0, 10).forEach(user => {
      console.log(`   ${user.id}. ${user.name.substring(0, 50)}${user.name.length > 50 ? '...' : ''}`);
    });
    
    if (usersToDelete.length > 10) {
      console.log(`   ... et ${usersToDelete.length - 10} autres`);
    }
    
    if (usersToDelete.length > 0) {
      // Supprimer les teacher_setups associés
      console.log('\n🔧 Suppression des configurations enseignant...');
      for (const user of usersToDelete) {
        await sql`DELETE FROM teacher_setups WHERE teacher_id = ${user.id}`;
      }
      
      // Supprimer les utilisateurs corrompus
      console.log('🗑️ Suppression des utilisateurs corrompus...');
      const userIds = usersToDelete.map(u => u.id);
      await sql`DELETE FROM users WHERE id = ANY(${userIds})`;
      
      console.log(`✅ ${usersToDelete.length} utilisateurs corrompus supprimés`);
    }
    
    // Vérifier le résultat
    const remainingUsers = await sql`
      SELECT id, username, name, role, user_code
      FROM users 
      ORDER BY role, id
    `;
    
    console.log('\n📊 Utilisateurs restants (propres):');
    remainingUsers.forEach(user => {
      console.log(`   ${user.user_code || user.id} → ${user.name} (${user.username}) - ${user.role}`);
    });
    
    console.log('\n✅ Base de données nettoyée !');
    console.log('💡 Maintenant vous pouvez tester le nouvel import Pronote corrigé');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter le nettoyage
resetToCleanUsers();
