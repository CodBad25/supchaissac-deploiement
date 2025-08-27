#!/usr/bin/env node

/**
 * 🔐 Script de création d'utilisateurs sécurisés pour SupChaissac
 * 
 * Ce script génère des utilisateurs avec des mots de passe forts
 * pour la production, tout en gardant les comptes de test.
 */

import { createStorage } from '../server/storage-factory.js';
import { hashPassword } from '../server/auth.js';
import crypto from 'crypto';

// Fonction pour générer un mot de passe fort
function generateStrongPassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Utilisateurs sécurisés pour la production
const secureUsers = [
  {
    username: 'enseignant@supchaissac.fr',
    name: 'Enseignant Exemple',
    role: 'TEACHER',
    initials: 'EE',
    inPacte: false
  },
  {
    username: 'secretaire@supchaissac.fr', 
    name: 'Secrétaire Exemple',
    role: 'SECRETARY',
    initials: 'SE'
  },
  {
    username: 'principal@supchaissac.fr',
    name: 'Principal Exemple', 
    role: 'PRINCIPAL',
    initials: 'PE'
  },
  {
    username: 'admin@supchaissac.fr',
    name: 'Administrateur Système',
    role: 'ADMIN', 
    initials: 'AS'
  }
];

async function createSecureUsers() {
  console.log('🔐 Création des utilisateurs sécurisés...\n');
  
  const storage = await createStorage();
  const credentials = [];
  
  for (const userData of secureUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log(`⚠️  Utilisateur ${userData.username} existe déjà - ignoré`);
        continue;
      }
      
      // Générer un mot de passe fort
      const password = generateStrongPassword();
      const hashedPassword = await hashPassword(password);
      
      // Créer l'utilisateur
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      credentials.push({
        username: userData.username,
        password: password,
        name: userData.name,
        role: userData.role
      });
      
      console.log(`✅ Utilisateur créé: ${userData.name} (${userData.role})`);
      
    } catch (error) {
      console.error(`❌ Erreur création ${userData.username}:`, error.message);
    }
  }
  
  // Afficher les identifiants
  if (credentials.length > 0) {
    console.log('\n🔑 IDENTIFIANTS GÉNÉRÉS (À CONSERVER PRÉCIEUSEMENT) :\n');
    console.log('='.repeat(80));
    
    credentials.forEach(cred => {
      console.log(`👤 ${cred.name} (${cred.role})`);
      console.log(`   Email: ${cred.username}`);
      console.log(`   Mot de passe: ${cred.password}`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    console.log('⚠️  IMPORTANT: Sauvegardez ces mots de passe dans un endroit sûr !');
    console.log('⚠️  Ils ne seront plus affichés après cette exécution.');
  }
  
  await storage.close?.();
  console.log('\n✅ Création terminée !');
}

// Exécution du script
createSecureUsers().catch(console.error);
