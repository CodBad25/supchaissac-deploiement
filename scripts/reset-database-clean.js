#!/usr/bin/env node

// 🧹 Reset complet de la base avec IDs propres

import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function resetDatabaseClean() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🧹 RESET COMPLET DE LA BASE - IDs propres...');
  
  let sql;
  
  try {
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // 1. Supprimer TOUS les utilisateurs
    console.log('🗑️ Suppression de tous les utilisateurs...');
    await sql`DELETE FROM teacher_setups`;
    await sql`DELETE FROM sessions WHERE teacher_id IS NOT NULL`;
    await sql`DELETE FROM users`;
    
    // 2. Reset des séquences pour repartir à 1
    console.log('🔄 Reset des séquences ID...');
    await sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE teacher_setups_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE sessions_id_seq RESTART WITH 1`;
    
    // 3. Recréer les utilisateurs de test avec IDs propres
    console.log('👥 Création des utilisateurs de test avec IDs propres...');
    
    const testUsers = [
      { username: 'admin@example.com', name: 'Admin', role: 'ADMIN', userCode: 'A001' },
      { username: 'principal@example.com', name: 'Jean DUPONT', role: 'PRINCIPAL', userCode: 'P001' },
      { username: 'secretary@example.com', name: 'Laure MARTIN', role: 'SECRETARY', userCode: 'S001' },
      { username: 'teacher1@example.com', name: 'Sophie MARTIN', role: 'TEACHER', userCode: 'T001' },
      { username: 'teacher2@example.com', name: 'Marie PETIT', role: 'TEACHER', userCode: 'T002' },
      { username: 'teacher3@example.com', name: 'Martin DUBOIS', role: 'TEACHER', userCode: 'T003' },
      { username: 'teacher4@example.com', name: 'Philippe GARCIA', role: 'TEACHER', userCode: 'T004' }
    ];
    
    for (const user of testUsers) {
      const initials = user.name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
      
      await sql`
        INSERT INTO users (username, name, role, initials, password, in_pacte, user_code)
        VALUES (${user.username}, ${user.name}, ${user.role}, ${initials}, 
                '$2b$10$8K1p/a0dqNOH0kOiVtMJ2uKSHDdyiSDEkk014i/aQ8.R1C1bGqn6i', 
                ${user.role === 'TEACHER'}, ${user.userCode})
      `;
      
      console.log(`   ✅ ${user.userCode} → ${user.name} (${user.role})`);
    }
    
    // 4. Vérifier le résultat
    const users = await sql`SELECT id, user_code, name, username, role FROM users ORDER BY id`;
    
    console.log('\n📊 Base réinitialisée - Utilisateurs avec IDs propres:');
    users.forEach(user => {
      console.log(`   ID ${user.id} → ${user.user_code} → ${user.name} (${user.role})`);
    });
    
    console.log('\n✅ Reset terminé ! Base propre avec IDs 1-7');
    console.log('💡 Prêt pour un import Pronote propre');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

resetDatabaseClean();
