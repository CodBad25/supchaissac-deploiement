#!/usr/bin/env node

// 🔢 Script pour ajouter des codes utilisateur lisibles

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function addUserCodes() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔢 Ajout des codes utilisateur lisibles...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Ajouter la colonne user_code si elle n'existe pas
    try {
      await sql`ALTER TABLE users ADD COLUMN user_code TEXT UNIQUE`;
      console.log('✅ Colonne user_code ajoutée');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Colonne user_code existe déjà');
      } else {
        throw error;
      }
    }
    
    // Récupérer tous les utilisateurs
    const users = await sql`
      SELECT id, username, name, role 
      FROM users 
      WHERE user_code IS NULL
      ORDER BY role, id
    `;
    
    console.log(`🔍 ${users.length} utilisateurs sans code trouvés`);
    
    // Compteurs par rôle
    const counters = {
      TEACHER: 1,
      SECRETARY: 1,
      PRINCIPAL: 1,
      ADMIN: 1
    };
    
    // Générer les codes
    for (const user of users) {
      const rolePrefix = {
        TEACHER: 'T',
        SECRETARY: 'S', 
        PRINCIPAL: 'P',
        ADMIN: 'A'
      }[user.role];
      
      const code = `${rolePrefix}${counters[user.role].toString().padStart(3, '0')}`;
      
      await sql`
        UPDATE users 
        SET user_code = ${code}
        WHERE id = ${user.id}
      `;
      
      console.log(`   ${code} → ${user.name} (${user.role})`);
      counters[user.role]++;
    }
    
    // Vérifier le résultat
    const updatedUsers = await sql`
      SELECT user_code, name, role 
      FROM users 
      ORDER BY role, user_code
    `;
    
    console.log('\n📊 Codes utilisateur générés:');
    updatedUsers.forEach(user => {
      console.log(`   ${user.user_code} → ${user.name} (${user.role})`);
    });
    
    console.log('\n✅ Codes utilisateur ajoutés avec succès !');
    console.log('💡 Maintenant les utilisateurs ont des codes lisibles : T001, T002, S001, P001, A001');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter l'ajout des codes
addUserCodes();
