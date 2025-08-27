#!/usr/bin/env node

// 🔧 Script pour corriger l'enum session_status
// Ajoute les valeurs manquantes à l'enum

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('🔧 Correction de l\'enum session_status...');
    
    // 1. Vérifier les valeurs actuelles de l'enum
    const currentValues = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'session_status'
      )
      ORDER BY enumsortorder
    `;
    
    const existingValues = currentValues.map(row => row.enumlabel);
    console.log('📋 Valeurs actuelles de l\'enum:', existingValues);
    
    // 2. Valeurs requises selon le schéma
    const requiredValues = ['DRAFT', 'PENDING_REVIEW', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED'];
    
    // 3. Ajouter les valeurs manquantes une par une
    if (!existingValues.includes('DRAFT')) {
      try {
        await sql`ALTER TYPE session_status ADD VALUE 'DRAFT'`;
        console.log('✅ Valeur DRAFT ajoutée à l\'enum');
      } catch (error) {
        console.log('❌ Erreur pour DRAFT:', error.message);
      }
    } else {
      console.log('ℹ️  Valeur DRAFT existe déjà');
    }

    if (!existingValues.includes('PENDING_REVIEW')) {
      try {
        await sql`ALTER TYPE session_status ADD VALUE 'PENDING_REVIEW'`;
        console.log('✅ Valeur PENDING_REVIEW ajoutée à l\'enum');
      } catch (error) {
        console.log('❌ Erreur pour PENDING_REVIEW:', error.message);
      }
    } else {
      console.log('ℹ️  Valeur PENDING_REVIEW existe déjà');
    }

    if (!existingValues.includes('PENDING_VALIDATION')) {
      try {
        await sql`ALTER TYPE session_status ADD VALUE 'PENDING_VALIDATION'`;
        console.log('✅ Valeur PENDING_VALIDATION ajoutée à l\'enum');
      } catch (error) {
        console.log('❌ Erreur pour PENDING_VALIDATION:', error.message);
      }
    } else {
      console.log('ℹ️  Valeur PENDING_VALIDATION existe déjà');
    }
    
    // 4. Vérifier les valeurs finales
    const finalValues = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'session_status'
      )
      ORDER BY enumsortorder
    `;
    
    console.log('\n📊 Valeurs finales de l\'enum session_status:');
    finalValues.forEach(row => {
      console.log(`   - ${row.enumlabel}`);
    });
    
    // 5. Test d'insertion avec PENDING_REVIEW
    try {
      const testResult = await sql`
        SELECT 'PENDING_REVIEW'::session_status as test_value
      `;
      console.log('\n✅ Test de l\'enum réussi !', testResult[0]);
    } catch (error) {
      console.log('\n❌ Test de l\'enum échoué:', error.message);
    }
    
    console.log('\n🎉 Correction de l\'enum terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
}

main();
