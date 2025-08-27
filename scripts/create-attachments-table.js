#!/usr/bin/env node

// 🔧 Script pour créer la table attachments

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('📎 Création de la table attachments...');
    
    // Créer la table attachments
    await sql`
      CREATE TABLE IF NOT EXISTS attachments (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by INTEGER NOT NULL REFERENCES users(id),
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        is_archived BOOLEAN DEFAULT FALSE,
        archived_by INTEGER REFERENCES users(id),
        archived_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('✅ Table attachments créée avec succès');
    
    // Vérifier la structure
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'attachments' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Structure de la table attachments:');
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    
    console.log('\n🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

main();
