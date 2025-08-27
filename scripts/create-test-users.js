#!/usr/bin/env node

// 🧪 Script de création des utilisateurs de test pour PostgreSQL
// Crée les mêmes utilisateurs que dans SQLite

import dotenv from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

// Charger les variables d'environnement
dotenv.config();

async function createTestUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('👥 Création des utilisateurs de test...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Utilisateurs de test à créer
    const testUsers = [
      {
        username: 'teacher1@example.com',
        name: 'Sophie Martin',
        role: 'TEACHER',
        initials: 'SM',
        inPacte: false,
        password: 'password123'
      },
      {
        username: 'teacher2@example.com',
        name: 'Marie Petit',
        role: 'TEACHER',
        initials: 'MP',
        inPacte: true,
        password: 'password123'
      },
      {
        username: 'teacher3@example.com',
        name: 'Martin Dubois',
        role: 'TEACHER',
        initials: 'MD',
        inPacte: false,
        password: 'password123'
      },
      {
        username: 'teacher4@example.com',
        name: 'Philippe Garcia',
        role: 'TEACHER',
        initials: 'PG',
        inPacte: true,
        password: 'password123'
      },
      {
        username: 'secretary@example.com',
        name: 'Laure Martin',
        role: 'SECRETARY',
        initials: 'LM',
        inPacte: false,
        password: 'password123'
      },
      {
        username: 'principal@example.com',
        name: 'Jean Dupont',
        role: 'PRINCIPAL',
        initials: 'JD',
        inPacte: false,
        password: 'password123'
      },
      {
        username: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
        initials: 'ADM',
        inPacte: false,
        password: 'password123'
      }
    ];
    
    console.log(`📝 Création de ${testUsers.length} utilisateurs...`);
    
    for (const user of testUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existing = await sql`
          SELECT id FROM users WHERE username = ${user.username}
        `;
        
        if (existing.length > 0) {
          console.log(`⚠️  ${user.name} (${user.username}) existe déjà`);
          continue;
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Créer l'utilisateur
        const result = await sql`
          INSERT INTO users (username, name, role, initials, in_pacte, password, created_at, updated_at)
          VALUES (${user.username}, ${user.name}, ${user.role}, ${user.initials}, ${user.inPacte}, ${hashedPassword}, NOW(), NOW())
          RETURNING id, name, username, role
        `;
        
        console.log(`✅ ${result[0].name} (${result[0].role}) créé avec ID ${result[0].id}`);
        
        // Créer la configuration enseignant si c'est un enseignant
        if (user.role === 'TEACHER') {
          await sql`
            INSERT INTO teacher_setups (user_id, in_pacte, created_at, updated_at)
            VALUES (${result[0].id}, ${user.inPacte}, NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING
          `;
          console.log(`   📋 Configuration enseignant créée (PACTE: ${user.inPacte})`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur création ${user.name}:`, error.message);
      }
    }
    
    // Vérification finale
    console.log('\n📊 Vérification des utilisateurs créés:');
    const allUsers = await sql`
      SELECT id, name, username, role, in_pacte 
      FROM users 
      ORDER BY role, name
    `;
    
    console.log(`👥 Total: ${allUsers.length} utilisateurs`);
    
    const roleCount = {};
    allUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      console.log(`   ${user.id}. ${user.name} (${user.username}) - ${user.role}${user.in_pacte ? ' [PACTE]' : ''}`);
    });
    
    console.log('\n📈 Répartition par rôle:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    console.log('\n🎉 Utilisateurs de test créés avec succès !');
    console.log('💡 Vous pouvez maintenant vous connecter avec:');
    console.log('   📧 Email: teacher1@example.com');
    console.log('   🔑 Mot de passe: password123');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter la création
createTestUsers();
