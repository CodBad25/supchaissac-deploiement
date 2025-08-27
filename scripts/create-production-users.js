#!/usr/bin/env node

/**
 * 👥 Création des utilisateurs pour la production
 * Crée des comptes avec mots de passe hachés correctement
 */

import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('👥 Creation des utilisateurs pour la production\n');

// Configuration de la base de données
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL non definie dans .env');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

// Utilisateurs à créer
const productionUsers = [
  {
    username: 'admin@example.com',
    password: 'admin123!',
    name: 'Administrateur',
    role: 'ADMIN',
    initials: 'ADM'
  },
  {
    username: 'principal@example.com', 
    password: 'principal123!',
    name: 'Principal',
    role: 'PRINCIPAL',
    initials: 'PRI'
  },
  {
    username: 'secretary@example.com',
    password: 'secretary123!', 
    name: 'Secretaire',
    role: 'SECRETARY',
    initials: 'SEC'
  },
  {
    username: 'teacher1@example.com',
    password: 'teacher123!',
    name: 'Enseignant Test',
    role: 'TEACHER', 
    initials: 'ENS'
  }
];

async function hashPassword(password) {
  const saltRounds = 12; // Plus sécurisé pour la production
  return await bcrypt.hash(password, saltRounds);
}

async function createUser(userData) {
  try {
    console.log(`👤 Creation utilisateur: ${userData.name} (${userData.role})`);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log(`   ⚠️  Utilisateur existe deja, mise a jour du mot de passe...`);
      
      // Mettre à jour le mot de passe
      const hashedPassword = await hashPassword(userData.password);
      await db.update(users)
        .set({ 
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          initials: userData.initials
        })
        .where(eq(users.username, userData.username));
      
      console.log(`   ✅ Utilisateur mis a jour`);
    } else {
      // Créer un nouvel utilisateur
      const hashedPassword = await hashPassword(userData.password);
      
      await db.insert(users).values({
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        initials: userData.initials,
        inPacte: false
      });
      
      console.log(`   ✅ Utilisateur cree`);
    }
    
    console.log(`   📧 Email: ${userData.username}`);
    console.log(`   🔑 Mot de passe: ${userData.password}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur creation ${userData.username}:`, error.message);
    return false;
  }
}

async function createAllUsers() {
  console.log('🔗 Connexion a la base de donnees...');
  
  try {
    // Test de connexion
    await sql`SELECT 1`;
    console.log('✅ Connexion reussie\n');
    
    let successCount = 0;
    let totalCount = productionUsers.length;
    
    for (const userData of productionUsers) {
      const success = await createUser(userData);
      if (success) successCount++;
    }
    
    console.log('📊 Resume:');
    console.log(`   ✅ Utilisateurs crees/mis a jour: ${successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 Tous les utilisateurs ont ete crees avec succes !');
      console.log('\n🔐 Informations de connexion:');
      console.log('┌─────────────────────────────┬─────────────────┬──────────────┐');
      console.log('│ Email                       │ Mot de passe    │ Role         │');
      console.log('├─────────────────────────────┼─────────────────┼──────────────┤');
      
      productionUsers.forEach(user => {
        const email = user.username.padEnd(27);
        const password = user.password.padEnd(15);
        const role = user.role.padEnd(12);
        console.log(`│ ${email} │ ${password} │ ${role} │`);
      });
      
      console.log('└─────────────────────────────┴─────────────────┴──────────────┘');
      
      console.log('\n⚠️  IMPORTANT:');
      console.log('   - Changez ces mots de passe apres la premiere connexion');
      console.log('   - Ne partagez jamais ces informations');
      console.log('   - Supprimez ce script apres utilisation');
      
      return true;
    } else {
      console.log('\n🚨 Certains utilisateurs n\'ont pas pu etre crees.');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Erreur de connexion a la base:', error.message);
    return false;
  } finally {
    await sql.end();
  }
}

// Exécuter la création
createAllUsers().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
