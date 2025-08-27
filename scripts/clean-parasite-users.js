#!/usr/bin/env node

// 🧹 Script pour supprimer les utilisateurs parasites

import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function cleanParasiteUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🧹 Suppression des utilisateurs parasites...');
  
  let sql;
  
  try {
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Identifier les utilisateurs parasites
    const parasiteUsers = await sql`
      SELECT id, username, name 
      FROM users 
      WHERE 
        name ILIKE '%prenom%' OR 
        name ILIKE '%nom%' OR
        name ILIKE '%login%' OR
        name ILIKE '%email%' OR
        name ILIKE '%discipline%' OR
        name ILIKE '%maths%' OR
        name ILIKE '%francais%' OR
        name ILIKE '%allemand%' OR
        name ILIKE '%anglais%' OR
        name ILIKE '%eps%' OR
        name ILIKE '%edmus%' OR
        name ILIKE '%l1%' OR
        name ILIKE '%l0%' OR
        username ILIKE '%@ac-nantes.fr%' AND length(username) > 50
    `;
    
    console.log(`🔍 ${parasiteUsers.length} utilisateurs parasites détectés:`);
    parasiteUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.username})`);
    });
    
    if (parasiteUsers.length > 0) {
      // Supprimer les teacher_setups associés
      for (const user of parasiteUsers) {
        await sql`DELETE FROM teacher_setups WHERE teacher_id = ${user.id}`;
      }
      
      // Supprimer les utilisateurs parasites
      const userIds = parasiteUsers.map(u => u.id);
      await sql`DELETE FROM users WHERE id = ANY(${userIds})`;
      
      console.log(`✅ ${parasiteUsers.length} utilisateurs parasites supprimés`);
    } else {
      console.log('✅ Aucun utilisateur parasite trouvé');
    }
    
    // Vérifier le résultat
    const remainingUsers = await sql`
      SELECT id, name, username, role 
      FROM users 
      ORDER BY role, id
    `;
    
    console.log('\n📊 Utilisateurs restants (propres):');
    remainingUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.role})`);
    });
    
    console.log('\n✅ Nettoyage terminé !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

cleanParasiteUsers();
