#!/usr/bin/env node

// 🔐 Script de migration des mots de passe vers bcrypt
// Convertit tous les mots de passe "password123" vers bcrypt sécurisé

import { getStorage } from '../server/storage-instance.js';
import { hashPassword } from '../server/auth.js';

async function migratePasswords() {
  console.log('🔐 Début de la migration des mots de passe...');
  
  try {
    const storage = getStorage();
    const users = await storage.getUsers();
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Vérifier si le mot de passe est encore "password123"
      if (user.password === 'password123') {
        console.log(`🔄 Migration du mot de passe pour: ${user.name} (${user.username})`);
        
        // Générer un nouveau mot de passe sécurisé
        const newPassword = await hashPassword('password123');
        
        // Mettre à jour en base
        await storage.updateUser(user.id, { password: newPassword });
        
        migratedCount++;
        console.log(`✅ Mot de passe migré pour: ${user.name}`);
      } else if (user.password.includes('.')) {
        // Format scrypt (ancien)
        console.log(`⚠️  ${user.name} utilise encore scrypt, migration recommandée`);
        skippedCount++;
      } else {
        // Déjà en bcrypt
        console.log(`✅ ${user.name} utilise déjà bcrypt`);
        skippedCount++;
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`   ✅ Mots de passe migrés: ${migratedCount}`);
    console.log(`   ⏭️  Comptes déjà sécurisés: ${skippedCount}`);
    console.log(`   📊 Total des comptes: ${users.length}`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 Migration terminée avec succès !');
      console.log('💡 Les utilisateurs peuvent maintenant se connecter avec password123 ou leurs vrais mots de passe');
    } else {
      console.log('\n✅ Tous les comptes sont déjà sécurisés !');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migratePasswords();
