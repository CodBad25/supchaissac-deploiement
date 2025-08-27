#!/usr/bin/env node

// 🧹 Script pour nettoyer les utilisateurs corrompus

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function cleanCorruptedUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🧹 Nettoyage des utilisateurs corrompus...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Identifier les utilisateurs corrompus (noms contenant +ADs-)
    const corruptedUsers = await sql`
      SELECT id, username, name 
      FROM users 
      WHERE name LIKE '%+ADs-%' OR username LIKE '%+ADs-%'
      ORDER BY created_at DESC
    `;
    
    console.log(`\n🔍 ${corruptedUsers.length} utilisateurs corrompus détectés`);
    
    if (corruptedUsers.length > 0) {
      console.log('\n🗑️ Suppression des utilisateurs corrompus...');
      
      // Supprimer d'abord les teacher_setups associés
      for (const user of corruptedUsers) {
        await sql`DELETE FROM teacher_setups WHERE teacher_id = ${user.id}`;
      }
      
      // Supprimer les utilisateurs corrompus
      await sql`
        DELETE FROM users 
        WHERE name LIKE '%+ADs-%' OR username LIKE '%+ADs-%'
      `;
      
      console.log(`✅ ${corruptedUsers.length} utilisateurs corrompus supprimés`);
    }
    
    // Vérifier le résultat
    const remainingUsers = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `;
    
    console.log('\n📊 Utilisateurs restants:');
    remainingUsers.forEach(r => {
      console.log(`   ${r.role}: ${r.count} utilisateurs`);
    });
    
    console.log('\n✅ Base de données nettoyée !');
    
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
cleanCorruptedUsers();
