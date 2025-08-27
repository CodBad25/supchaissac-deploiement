#!/usr/bin/env node

// 🔍 Script pour vérifier la structure des tables PostgreSQL

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function checkTableStructure() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔍 Vérification de la structure des tables...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Vérifier la structure de la table users
    console.log('\n👥 STRUCTURE TABLE USERS:');
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    usersColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Vérifier la structure de la table teacher_setups
    console.log('\n⚙️ STRUCTURE TABLE TEACHER_SETUPS:');
    const setupsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'teacher_setups' 
      ORDER BY ordinal_position
    `;
    
    setupsColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Vérifier si la colonne in_pacte existe dans teacher_setups
    const hasPacteColumn = setupsColumns.some(col => col.column_name === 'in_pacte');
    console.log(`\n🔍 Colonne 'in_pacte' dans teacher_setups: ${hasPacteColumn ? '✅ EXISTE' : '❌ MANQUANTE'}`);
    
    if (!hasPacteColumn) {
      console.log('\n🔧 SOLUTION: La colonne in_pacte est dans la table users, pas dans teacher_setups');
      console.log('   → Le statut PACTE doit être géré via users.in_pacte');
      console.log('   → teacher_setups ne contient que les préférences de l\'enseignant');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter la vérification
checkTableStructure();
