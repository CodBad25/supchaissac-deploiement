#!/usr/bin/env node

// 🔧 Script pour vérifier la structure de la table sessions

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('🔍 Vérification de la structure de la table sessions...');
    
    // 1. Vérifier les colonnes de la table sessions
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Structure de la table sessions:');
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    
    // 2. Vérifier si original_type existe et ses contraintes
    const originalTypeColumn = columns.find(col => col.column_name === 'original_type');
    if (originalTypeColumn) {
      console.log('\n⚠️  PROBLÈME DÉTECTÉ: La colonne original_type existe et est NOT NULL');
      console.log('   Mais le schéma principal ne l\'inclut pas !');
      
      // Proposer une solution
      console.log('\n💡 SOLUTIONS POSSIBLES:');
      console.log('   1. Supprimer la colonne original_type de la DB');
      console.log('   2. Ajouter original_type au schéma principal');
      console.log('   3. Rendre original_type nullable');
    } else {
      console.log('\n✅ La colonne original_type n\'existe pas - c\'est normal');
    }
    
    // 3. Vérifier les contraintes NOT NULL problématiques
    const notNullColumns = columns.filter(col => col.is_nullable === 'NO');
    console.log('\n🔒 Colonnes NOT NULL:');
    notNullColumns.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
}

main();
