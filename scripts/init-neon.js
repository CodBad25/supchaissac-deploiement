#!/usr/bin/env node

// 🔧 Script d'initialisation des tables Neon
// Corrige les différences de schéma

import dotenv from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement
dotenv.config();

async function initNeonTables() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  
  console.log('🔧 Initialisation des tables Neon...');
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });
    
    console.log('🔌 Connexion à Neon...');
    
    // Ajouter les colonnes manquantes si elles n'existent pas
    console.log('📊 Ajout des colonnes manquantes...');
    
    try {
      await sql`
        ALTER TABLE system_settings 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
      `;
      console.log('✅ Colonnes ajoutées à system_settings');
    } catch (error) {
      console.log('⚠️  system_settings déjà à jour');
    }
    
    try {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
      `;
      console.log('✅ Colonnes ajoutées à users');
    } catch (error) {
      console.log('⚠️  users déjà à jour');
    }
    
    try {
      await sql`
        ALTER TABLE sessions
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP
      `;
      console.log('✅ Colonnes ajoutées à sessions');
    } catch (error) {
      console.log('⚠️  sessions déjà à jour');
    }
    
    try {
      await sql`
        ALTER TABLE teacher_setups 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
      `;
      console.log('✅ Colonnes ajoutées à teacher_setups');
    } catch (error) {
      console.log('⚠️  teacher_setups déjà à jour');
    }
    
    // Créer la table session pour Express si elle n'existe pas
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS session (
          sid TEXT PRIMARY KEY,
          sess TEXT NOT NULL,
          expire TIMESTAMP NOT NULL
        )
      `;
      console.log('✅ Table session créée');
    } catch (error) {
      console.log('⚠️  Table session déjà existante');
    }
    
    // Insérer les paramètres système par défaut
    console.log('⚙️ Insertion des paramètres système...');
    
    const defaultSettings = [
      ['app_version', '1.0.0', 'Version de l\'application SupChaissac'],
      ['school_name', 'Collège Chaissac', 'Nom de l\'établissement'],
      ['academic_year', '2024-2025', 'Année scolaire en cours'],
      ['max_hours_per_week', '35', 'Nombre maximum d\'heures par semaine'],
      ['rgpd_retention_years', '5', 'Durée de rétention des données (années)']
    ];
    
    for (const [key, value, description] of defaultSettings) {
      try {
        await sql`
          INSERT INTO system_settings (key, value, description, created_at, updated_at) 
          VALUES (${key}, ${value}, ${description}, NOW(), NOW())
          ON CONFLICT (key) DO NOTHING
        `;
      } catch (error) {
        console.log(`⚠️  Paramètre ${key} déjà existant`);
      }
    }
    
    console.log('✅ Paramètres système configurés');
    
    // Test final
    console.log('🧪 Test final...');
    const result = await sql`SELECT COUNT(*) as count FROM system_settings`;
    console.log(`📊 ${result[0].count} paramètres système configurés`);
    
    console.log('\n🎉 Initialisation Neon terminée avec succès !');
    console.log('💡 Vous pouvez maintenant utiliser SupChaissac avec PostgreSQL');
    
  } catch (error) {
    console.log('❌ Erreur initialisation:', error.message);
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter l'initialisation
initNeonTables();
