#!/usr/bin/env node

// 🔧 Script pour corriger le schéma de la table sessions
// Ajoute les colonnes manquantes pour la validation des séances

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('🔧 Correction du schéma de la table sessions...');
    
    // 1. Vérifier si les colonnes existent déjà
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      AND table_schema = 'public'
    `;
    
    const existingColumns = columns.map(col => col.column_name);
    console.log('📋 Colonnes existantes:', existingColumns);
    
    // 2. Ajouter les colonnes manquantes une par une
    if (!existingColumns.includes('validated_by')) {
      try {
        await sql`ALTER TABLE sessions ADD COLUMN validated_by INTEGER REFERENCES users(id)`;
        console.log('✅ Colonne validated_by ajoutée');
      } catch (error) {
        console.log('❌ Erreur pour validated_by:', error.message);
      }
    } else {
      console.log('ℹ️  Colonne validated_by existe déjà');
    }

    if (!existingColumns.includes('validated_at')) {
      try {
        await sql`ALTER TABLE sessions ADD COLUMN validated_at TIMESTAMP`;
        console.log('✅ Colonne validated_at ajoutée');
      } catch (error) {
        console.log('❌ Erreur pour validated_at:', error.message);
      }
    } else {
      console.log('ℹ️  Colonne validated_at existe déjà');
    }

    if (!existingColumns.includes('rejection_reason')) {
      try {
        await sql`ALTER TABLE sessions ADD COLUMN rejection_reason TEXT`;
        console.log('✅ Colonne rejection_reason ajoutée');
      } catch (error) {
        console.log('❌ Erreur pour rejection_reason:', error.message);
      }
    } else {
      console.log('ℹ️  Colonne rejection_reason existe déjà');
    }
    
    // 3. Vérifier le schéma final
    const finalColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Schéma final de la table sessions:');
    finalColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // 4. Tester une requête simple
    try {
      const testQuery = await sql`SELECT id, status, validated_by FROM sessions LIMIT 1`;
      console.log('\n✅ Test de requête réussi !');
    } catch (error) {
      console.log('\n❌ Test de requête échoué:', error.message);
    }
    
    console.log('\n🎉 Migration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

main();
