#!/usr/bin/env node

// 🎨 Script pour ajouter la colonne gender aux utilisateurs existants
// Ce script ajoute la colonne gender et essaie de deviner le genre à partir du prénom

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

// Liste de prénoms pour deviner le genre
const PRENOMS_MASCULINS = [
  'pierre', 'jean', 'michel', 'alain', 'patrick', 'philippe', 'daniel', 'bernard', 'christian', 'françois',
  'marc', 'andré', 'claude', 'gérard', 'robert', 'jacques', 'henri', 'louis', 'paul', 'serge',
  'david', 'nicolas', 'julien', 'sébastien', 'laurent', 'thierry', 'pascal', 'olivier', 'antoine',
  'fabrice', 'stéphane', 'éric', 'frédéric', 'christophe', 'bruno', 'didier', 'yves', 'vincent'
];

const PRENOMS_FEMININS = [
  'marie', 'françoise', 'monique', 'catherine', 'nathalie', 'isabelle', 'jacqueline', 'sylvie', 'martine',
  'brigitte', 'nicole', 'christine', 'annie', 'chantal', 'dominique', 'véronique', 'patricia', 'sandrine',
  'claire', 'anne', 'sophie', 'valérie', 'corinne', 'céline', 'florence', 'pascale', 'laurence',
  'caroline', 'stéphanie', 'virginie', 'karine', 'audrey', 'laetitia', 'émilie', 'julie', 'alexandra'
];

function devinerGenre(prenom) {
  const prenomLower = prenom.toLowerCase().trim();
  
  if (PRENOMS_MASCULINS.includes(prenomLower)) {
    return 'M';
  } else if (PRENOMS_FEMININS.includes(prenomLower)) {
    return 'F';
  }
  
  // Règles heuristiques simples
  if (prenomLower.endsWith('e') && !prenomLower.endsWith('re') && !prenomLower.endsWith('le')) {
    return 'F';
  }
  
  return 'OTHER'; // Par défaut si on ne peut pas deviner
}

async function main() {
  try {
    console.log('🎨 Ajout de la colonne gender...');
    
    // 1. Créer l'enum gender s'il n'existe pas
    try {
      await sql`CREATE TYPE gender AS ENUM ('M', 'F', 'OTHER')`;
      console.log('✅ Enum gender créé');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Enum gender existe déjà');
      } else {
        throw error;
      }
    }
    
    // 2. Ajouter la colonne gender
    try {
      await sql`ALTER TABLE users ADD COLUMN gender gender DEFAULT 'OTHER'`;
      console.log('✅ Colonne gender ajoutée');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Colonne gender existe déjà');
      } else {
        throw error;
      }
    }
    
    // 3. Récupérer tous les utilisateurs
    const users = await sql`SELECT id, name FROM users WHERE gender = 'OTHER' OR gender IS NULL`;
    console.log(`📊 ${users.length} utilisateurs à traiter`);
    
    // 4. Mettre à jour le genre pour chaque utilisateur
    let updated = 0;
    for (const user of users) {
      try {
        // Extraire le prénom (premier mot du nom)
        const prenom = user.name.split(' ')[0];
        const genre = devinerGenre(prenom);
        
        await sql`UPDATE users SET gender = ${genre} WHERE id = ${user.id}`;
        
        console.log(`✅ ${user.name} → ${genre}`);
        updated++;
      } catch (error) {
        console.log(`❌ Erreur pour ${user.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration terminée !`);
    console.log(`📊 ${updated} utilisateurs mis à jour`);
    
    // 5. Afficher les statistiques
    const stats = await sql`
      SELECT gender, COUNT(*) as count 
      FROM users 
      GROUP BY gender 
      ORDER BY gender
    `;
    
    console.log('\n📈 Répartition par genre :');
    stats.forEach(stat => {
      const label = stat.gender === 'M' ? 'Hommes' : stat.gender === 'F' ? 'Femmes' : 'Autre/Inconnu';
      console.log(`   ${label}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

main();
