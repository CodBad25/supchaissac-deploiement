#!/usr/bin/env node

// 🔍 Script pour vérifier le rôle de l'admin

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function checkAdminRole() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔍 Vérification du rôle admin...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Récupérer tous les utilisateurs
    const users = await sql`
      SELECT id, username, name, role, in_pacte 
      FROM users 
      ORDER BY role, name
    `;
    
    console.log(`\n👥 ${users.length} utilisateurs trouvés:\n`);
    
    users.forEach(user => {
      const pacteStatus = user.role === 'TEACHER' ? (user.in_pacte ? ' [PACTE]' : ' [HORS PACTE]') : '';
      console.log(`   ${user.id}. ${user.name} (${user.username}) - ${user.role}${pacteStatus}`);
    });
    
    // Vérifier spécifiquement l'admin
    const adminUsers = users.filter(u => u.username === 'admin@example.com');
    
    if (adminUsers.length === 0) {
      console.log('\n❌ Aucun utilisateur admin@example.com trouvé !');
    } else {
      const admin = adminUsers[0];
      console.log(`\n🔍 Utilisateur admin@example.com:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nom: ${admin.name}`);
      console.log(`   Rôle: ${admin.role}`);
      
      if (admin.role !== 'ADMIN') {
        console.log(`\n⚠️  PROBLÈME: Le rôle devrait être ADMIN mais c'est ${admin.role}`);
        console.log('🔧 Correction du rôle...');
        
        await sql`
          UPDATE users 
          SET role = 'ADMIN' 
          WHERE username = 'admin@example.com'
        `;
        
        console.log('✅ Rôle corrigé en ADMIN');
      } else {
        console.log('✅ Rôle correct: ADMIN');
      }
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
checkAdminRole();
