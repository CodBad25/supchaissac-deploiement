#!/usr/bin/env node

// 🔍 Script pour vérifier les utilisateurs importés

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function checkImportedUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔍 Vérification des utilisateurs importés...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Compter tous les utilisateurs
    const totalCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n📊 Total utilisateurs dans la base: ${totalCount[0].count}`);
    
    // Compter par rôle
    const roleCount = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `;
    
    console.log('\n👥 Répartition par rôle:');
    roleCount.forEach(r => {
      console.log(`   ${r.role}: ${r.count} utilisateurs`);
    });
    
    // Lister les 10 derniers utilisateurs créés
    const recentUsers = await sql`
      SELECT id, username, name, role, in_pacte, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log('\n🕒 10 derniers utilisateurs créés:');
    recentUsers.forEach(user => {
      const date = new Date(user.created_at).toLocaleString('fr-FR');
      const pacte = user.role === 'TEACHER' ? (user.in_pacte ? ' [PACTE]' : ' [HORS PACTE]') : '';
      console.log(`   ${user.id}. ${user.name} (${user.username}) - ${user.role}${pacte} - ${date}`);
    });
    
    // Vérifier les enseignants spécifiquement
    const teachers = await sql`
      SELECT id, username, name, in_pacte, created_at
      FROM users 
      WHERE role = 'TEACHER'
      ORDER BY created_at DESC
    `;
    
    console.log(`\n👨‍🏫 Enseignants (${teachers.length} total):`);
    teachers.slice(0, 5).forEach(teacher => {
      const date = new Date(teacher.created_at).toLocaleString('fr-FR');
      const pacte = teacher.in_pacte ? '[PACTE]' : '[HORS PACTE]';
      console.log(`   ${teacher.id}. ${teacher.name} (${teacher.username}) ${pacte} - ${date}`);
    });
    
    if (teachers.length > 5) {
      console.log(`   ... et ${teachers.length - 5} autres enseignants`);
    }
    
    // Vérifier les teacher_setups
    const setupCount = await sql`SELECT COUNT(*) as count FROM teacher_setups`;
    console.log(`\n⚙️ Configurations enseignant (teacher_setups): ${setupCount[0].count}`);
    
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
checkImportedUsers();
