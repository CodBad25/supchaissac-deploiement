#!/usr/bin/env node

// 🧪 Script de test de connexion PostgreSQL
// Teste la connexion et initialise les tables si nécessaire

import dotenv from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

async function testPostgreSQL() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL non définie');
    console.log('💡 Configurez DATABASE_URL dans votre fichier .env');
    process.exit(1);
  }
  
  if (!databaseUrl.startsWith('postgresql://')) {
    console.log('❌ DATABASE_URL ne semble pas être une URL PostgreSQL');
    console.log('💡 Format attendu: postgresql://user:password@host:port/database');
    process.exit(1);
  }
  
  console.log('🧪 Test de connexion PostgreSQL...');
  console.log(`📍 URL: ${databaseUrl.replace(/:[^:@]*@/, ':***@')}`);
  
  let sql;
  
  try {
    // Créer la connexion
    sql = postgres(databaseUrl, {
      ssl: databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase.co') ? 'require' : false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Test de connexion basique
    console.log('🔌 Test de connexion...');
    const result = await sql`SELECT version(), current_database(), current_user`;
    
    console.log('✅ Connexion PostgreSQL réussie !');
    console.log(`📊 Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
    console.log(`🗄️ Base de données: ${result[0].current_database}`);
    console.log(`👤 Utilisateur: ${result[0].current_user}`);
    
    // Vérifier si les tables existent
    console.log('\n🔍 Vérification des tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'teacher_setups', 'system_settings', 'session')
      ORDER BY table_name
    `;
    
    const existingTables = tables.map(t => t.table_name);
    const requiredTables = ['users', 'sessions', 'teacher_setups', 'system_settings', 'session'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (existingTables.length > 0) {
      console.log(`✅ Tables existantes: ${existingTables.join(', ')}`);
    }
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Tables manquantes: ${missingTables.join(', ')}`);
      console.log('\n🔧 Initialisation des tables...');
      
      // Lire et exécuter le script SQL d'initialisation
      const sqlFile = path.join(__dirname, 'init-postgresql.sql');
      if (fs.existsSync(sqlFile)) {
        const initSQL = fs.readFileSync(sqlFile, 'utf8');
        
        try {
          await sql.unsafe(initSQL);
          console.log('✅ Tables créées avec succès !');
        } catch (error) {
          console.log('⚠️  Erreur lors de la création des tables:', error.message);
          console.log('💡 Les tables existent peut-être déjà ou il y a un problème de permissions');
        }
      } else {
        console.log('❌ Fichier init-postgresql.sql non trouvé');
        console.log('💡 Créez les tables manuellement ou copiez le fichier SQL');
      }
    } else {
      console.log('✅ Toutes les tables requises sont présentes');
    }
    
    // Test d'insertion/lecture
    console.log('\n🧪 Test d\'écriture/lecture...');
    try {
      // Insérer un paramètre de test
      await sql`
        INSERT INTO system_settings (key, value, description) 
        VALUES ('test_connection', ${'success'}, 'Test de connexion automatique')
        ON CONFLICT (key) DO UPDATE SET 
          value = EXCLUDED.value,
          updated_at = NOW()
      `;
      
      // Lire le paramètre
      const testResult = await sql`
        SELECT value FROM system_settings WHERE key = 'test_connection'
      `;
      
      if (testResult[0]?.value === 'success') {
        console.log('✅ Test d\'écriture/lecture réussi');
        
        // Nettoyer
        await sql`DELETE FROM system_settings WHERE key = 'test_connection'`;
      } else {
        console.log('❌ Test d\'écriture/lecture échoué');
      }
    } catch (error) {
      console.log('❌ Erreur test écriture/lecture:', error.message);
    }
    
    // Informations sur la région (pour Neon)
    if (databaseUrl.includes('neon.tech')) {
      const region = databaseUrl.match(/\.([^.]+)\.aws\.neon\.tech/)?.[1];
      if (region) {
        console.log(`\n🌍 Région Neon: ${region}`);
        if (region === 'eu-central-1') {
          console.log('✅ Région Frankfurt - Conforme RGPD 🇪🇺');
        } else if (region.startsWith('us-')) {
          console.log('⚠️  Région États-Unis - Attention RGPD 🇺🇸');
        }
      }
    }
    
    console.log('\n🎉 Test PostgreSQL terminé avec succès !');
    console.log('💡 Vous pouvez maintenant utiliser PostgreSQL avec SupChaissac');
    
  } catch (error) {
    console.log('❌ Erreur de connexion PostgreSQL:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Vérifiez l\'URL de la base de données');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Vérifiez le nom d\'utilisateur et le mot de passe');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 La base de données n\'existe pas, créez-la d\'abord');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Timeout de connexion, vérifiez la connectivité réseau');
    }
    
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifiez votre URL DATABASE_URL');
    console.log('   2. Assurez-vous que la base de données existe');
    console.log('   3. Vérifiez les credentials (utilisateur/mot de passe)');
    console.log('   4. Vérifiez la connectivité réseau');
    
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Exécuter le test
testPostgreSQL();
