#!/usr/bin/env node

// 📊 Script d'import des utilisateurs depuis un fichier CSV (export Pronote)
// Format attendu : Nom, Prénom, Email, Matière, Statut_PACTE

import dotenv from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

// Fonction pour parser un fichier CSV simple
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

// Fonction pour générer des initiales
function generateInitials(nom, prenom) {
  const nomInitial = nom.charAt(0).toUpperCase();
  const prenomInitial = prenom.charAt(0).toUpperCase();
  return `${prenomInitial}${nomInitial}`;
}

// Fonction pour générer un email si manquant
function generateEmail(nom, prenom) {
  const nomClean = nom.toLowerCase().replace(/[^a-z]/g, '');
  const prenomClean = prenom.toLowerCase().replace(/[^a-z]/g, '');
  return `${prenomClean}.${nomClean}@college-chaissac.fr`;
}

async function importUsersFromCSV(csvFilePath) {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('📊 Import des utilisateurs depuis CSV...');
  console.log(`📁 Fichier: ${csvFilePath}`);
  
  let sql;
  
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(csvFilePath)) {
      console.log(`❌ Fichier non trouvé: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Lire et parser le fichier CSV
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const users = parseCSV(csvContent);
    
    console.log(`📋 ${users.length} utilisateurs trouvés dans le CSV`);
    
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à la base de données...');
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const userData of users) {
      try {
        // Extraire les données (format flexible)
        const nom = userData.Nom || userData.nom || userData.NOM || '';
        const prenom = userData.Prénom || userData.prenom || userData.PRENOM || userData.Prenom || '';
        const email = userData.Email || userData.email || userData.EMAIL || generateEmail(nom, prenom);
        const matiere = userData.Matière || userData.matiere || userData.MATIERE || userData.Matiere || '';
        const pacteStr = userData.Statut_PACTE || userData.PACTE || userData.pacte || 'NON';
        const civilite = userData.CIVILITE || userData.Civilité || userData.civilite || '';
        
        // Validation des données obligatoires
        if (!nom || !prenom) {
          console.log(`⚠️  Ligne ignorée - Nom ou prénom manquant: ${JSON.stringify(userData)}`);
          skipped++;
          continue;
        }
        
        // Préparer les données utilisateur
        const username = email;
        const name = `${prenom} ${nom.toUpperCase()}`;
        const initials = generateInitials(nom, prenom);
        const inPacte = pacteStr.toUpperCase() === 'OUI' || pacteStr.toUpperCase() === 'TRUE' || pacteStr === '1';
        const role = 'TEACHER'; // Par défaut enseignant

        // Déterminer le genre à partir de la civilité
        let gender = 'OTHER';
        if (civilite.toLowerCase().includes('mme') || civilite.toLowerCase().includes('mlle')) {
          gender = 'F';
        } else if (civilite.toLowerCase().includes('m.') || civilite.toLowerCase().includes('mr')) {
          gender = 'M';
        }
        
        // Vérifier si l'utilisateur existe déjà
        const existing = await sql`
          SELECT id FROM users WHERE username = ${username}
        `;
        
        if (existing.length > 0) {
          console.log(`⚠️  Utilisateur existant ignoré: ${name} (${username})`);
          skipped++;
          continue;
        }
        
        // Hasher le mot de passe par défaut
        const defaultPassword = 'SupChaissac2025!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        // Créer l'utilisateur
        const result = await sql`
          INSERT INTO users (username, name, role, gender, initials, in_pacte, password, created_at, updated_at)
          VALUES (${username}, ${name}, ${role}, ${gender}, ${initials}, ${inPacte}, ${hashedPassword}, NOW(), NOW())
          RETURNING id, name, username, role, gender, in_pacte
        `;
        
        console.log(`✅ ${result[0].name} (${result[0].username}) - Genre: ${result[0].gender} - PACTE: ${result[0].in_pacte ? 'OUI' : 'NON'}`);
        
        // Créer la configuration enseignant
        await sql`
          INSERT INTO teacher_setups (user_id, in_pacte, preferred_subjects, created_at, updated_at)
          VALUES (${result[0].id}, ${inPacte}, ${matiere ? JSON.stringify([matiere]) : '[]'}, NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING
        `;
        
        imported++;
        
      } catch (error) {
        console.log(`❌ Erreur import utilisateur:`, error.message);
        errors++;
      }
    }
    
    // Résumé de l'import
    console.log('\n📊 RÉSUMÉ DE L\'IMPORT:');
    console.log(`✅ Importés: ${imported}`);
    console.log(`⚠️  Ignorés: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📋 Total traité: ${imported + skipped + errors}`);
    
    if (imported > 0) {
      console.log('\n💡 INFORMATIONS IMPORTANTES:');
      console.log('🔑 Mot de passe par défaut: SupChaissac2025!');
      console.log('📧 Les utilisateurs doivent changer leur mot de passe à la première connexion');
      console.log('⚙️  Vous pouvez modifier les rôles depuis l\'interface admin');
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

// Utilisation du script
const csvFile = process.argv[2];

if (!csvFile) {
  console.log('📋 UTILISATION:');
  console.log('node scripts/import-users-csv.js chemin/vers/fichier.csv');
  console.log('');
  console.log('📊 FORMAT CSV ATTENDU:');
  console.log('Nom,Prénom,Email,Matière,Statut_PACTE');
  console.log('MARTIN,Sophie,sophie.martin@college.fr,Mathématiques,OUI');
  console.log('DUBOIS,Pierre,pierre.dubois@college.fr,Français,NON');
  console.log('');
  console.log('💡 NOTES:');
  console.log('- L\'email est optionnel (généré automatiquement si manquant)');
  console.log('- Statut_PACTE: OUI/NON, TRUE/FALSE, 1/0');
  console.log('- Les noms de colonnes sont flexibles (Nom/nom/NOM)');
  process.exit(1);
}

// Exécuter l'import
importUsersFromCSV(csvFile);
