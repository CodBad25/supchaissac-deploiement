#!/usr/bin/env node

// 🔍 Script pour analyser en détail le fichier Pronote et comprendre sa structure

import fs from 'fs';
import iconv from 'iconv-lite';

function analyzePronoteFile() {
  console.log('🔍 Analyse détaillée du fichier Pronote...');
  
  // Lire le fichier brut
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('❌ Usage: node analyze-pronote-file.js <chemin-vers-fichier-csv>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Fichier non trouvé:', filePath);
    process.exit(1);
  }
  
  console.log('📁 Fichier:', filePath);
  
  // Lire le fichier brut
  const fileBuffer = fs.readFileSync(filePath);
  const rawContent = iconv.decode(fileBuffer, 'utf8');
  
  console.log('📊 Taille du fichier:', rawContent.length, 'caractères');
  console.log('🔍 Début du fichier (200 premiers caractères):');
  console.log('---');
  console.log(rawContent.substring(0, 200));
  console.log('---');
  
  // Analyser les séquences encodées
  const encodedSequences = rawContent.match(/\+[A-Z0-9]+-/g) || [];
  const uniqueSequences = [...new Set(encodedSequences)];
  
  console.log('\n🔤 Séquences encodées détectées:');
  uniqueSequences.forEach(seq => {
    console.log(`   ${seq}`);
  });
  
  // Décoder et analyser
  let decoded = rawContent
    .replace(/\+ADs-/g, ';')      // Point-virgule
    .replace(/\+AEA-/g, '@')      // Arobase
    .replace(/\+AC0-/g, '-')      // Tiret
    .replace(/\+ACY-/g, '&')      // Esperluette
    .replace(/\+ACI-/g, '"')      // Guillemet
    .replace(/\+ACA-/g, ' ')      // Espace
    .replace(/\+/g, '');          // Supprimer les + restants
  
  console.log('\n📝 Après décodage (200 premiers caractères):');
  console.log('---');
  console.log(decoded.substring(0, 200));
  console.log('---');
  
  // Analyser la structure
  const lines = decoded.split('\n').filter(line => line.trim());
  console.log('\n📊 Structure du fichier:');
  console.log(`   Nombre de lignes: ${lines.length}`);
  
  if (lines.length > 0) {
    const firstLine = lines[0];
    const fields = firstLine.split(';');
    
    console.log(`   Champs dans la première ligne: ${fields.length}`);
    console.log('\n🔍 Analyse des 15 premiers champs:');
    
    fields.slice(0, 15).forEach((field, index) => {
      const cleanField = field.trim();
      let type = 'TEXTE';
      
      if (cleanField.includes('@')) type = 'EMAIL';
      else if (cleanField.match(/^\d{2}\/\d{2}\/\d{2,4}$/)) type = 'DATE';
      else if (cleanField.match(/^[A-Z]+$/)) type = 'CODE';
      else if (cleanField.match(/^(M\.|Mme|Mr)$/)) type = 'CIVILITE';
      else if (cleanField.match(/^L\d{4}/)) type = 'CODE_MATIERE';
      else if (cleanField.match(/^[A-Z\s-]+$/)) type = 'NOM_MATIERE';
      else if (cleanField.match(/^\d[A-Z]$/)) type = 'CLASSE';
      
      console.log(`   [${index.toString().padStart(2, '0')}] ${type.padEnd(12)} : "${cleanField.substring(0, 30)}${cleanField.length > 30 ? '...' : ''}"`);
    });
    
    // Essayer de détecter la structure typique Pronote
    console.log('\n🎯 Détection de la structure Pronote:');
    
    const possibleStructure = {
      login: -1,
      civilite: -1,
      nom: -1,
      prenom: -1,
      email: -1,
      discipline: -1
    };
    
    fields.forEach((field, index) => {
      const cleanField = field.trim().toUpperCase();
      
      if (index < 15) { // Analyser seulement les 15 premiers champs
        if (cleanField.match(/^[A-Z]{1,10}$/) && possibleStructure.login === -1) {
          possibleStructure.login = index;
        } else if (cleanField.match(/^(M\.|MME|MR)$/i) && possibleStructure.civilite === -1) {
          possibleStructure.civilite = index;
        } else if (cleanField.match(/^[A-Z\s-]{2,20}$/) && !cleanField.includes('@') && possibleStructure.nom === -1) {
          possibleStructure.nom = index;
        } else if (cleanField.includes('@')) {
          possibleStructure.email = index;
        } else if (cleanField.match(/^L\d{4}/) || cleanField.match(/^[A-Z\s]{5,}$/)) {
          if (possibleStructure.discipline === -1) possibleStructure.discipline = index;
        }
      }
    });
    
    console.log('   Structure détectée:');
    Object.entries(possibleStructure).forEach(([key, index]) => {
      if (index !== -1) {
        console.log(`     ${key.toUpperCase().padEnd(10)} : Champ [${index.toString().padStart(2, '0')}] = "${fields[index].substring(0, 30)}"`);
      } else {
        console.log(`     ${key.toUpperCase().padEnd(10)} : NON DÉTECTÉ`);
      }
    });
  }
  
  // Analyser quelques lignes supplémentaires
  if (lines.length > 1) {
    console.log('\n📋 Analyse des 3 premières lignes de données:');
    lines.slice(0, 3).forEach((line, lineIndex) => {
      const fields = line.split(';');
      console.log(`\n   Ligne ${lineIndex + 1} (${fields.length} champs):`);
      fields.slice(0, 8).forEach((field, fieldIndex) => {
        console.log(`     [${fieldIndex.toString().padStart(2, '0')}] "${field.substring(0, 25)}${field.length > 25 ? '...' : ''}"`);
      });
    });
  }
  
  console.log('\n✅ Analyse terminée !');
  console.log('💡 Utilisez ces informations pour corriger le décodeur Pronote');
}

// Exécuter l'analyse
analyzePronoteFile();
