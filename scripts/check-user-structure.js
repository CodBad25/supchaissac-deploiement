#!/usr/bin/env node

// 🔍 Script pour vérifier la structure des utilisateurs

import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function checkUserStructure() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔍 Vérification de la structure des utilisateurs...');
  
  let sql;
  
  try {
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Vérifier la structure de la table users
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Structure de la table users:');
    tableInfo.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Regarder quelques exemples d'utilisateurs
    const sampleUsers = await sql`
      SELECT id, username, name, role 
      FROM users 
      WHERE role = 'TEACHER'
      LIMIT 5
    `;
    
    console.log('\n👥 Exemples d\'utilisateurs enseignants:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.name}`);
      console.log(`      username: "${user.username}"`);
      console.log(`      role: ${user.role}`);
      console.log('');
    });
    
    console.log('✅ Vérification terminée !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

checkUserStructure();
