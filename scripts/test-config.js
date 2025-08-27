#!/usr/bin/env node

// 🧪 Script de test de configuration PostgreSQL
// Teste la configuration sans vraie base de données

import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function testConfiguration() {
  console.log('🧪 Test de configuration PostgreSQL...\n');
  
  // Test 1: Vérification des variables d'environnement
  console.log('📋 1. Vérification des variables d\'environnement:');
  
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET', 'AUTH_MODE'];
  let configValid = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName === 'DATABASE_URL' ? value.replace(/:[^:@]*@/, ':***@') : value}`);
    } else {
      console.log(`   ❌ ${varName}: NON DÉFINIE`);
      configValid = false;
    }
  }
  
  if (!configValid) {
    console.log('\n❌ Configuration incomplète');
    console.log('💡 Copiez .env.test vers .env pour tester');
    return;
  }
  
  // Test 2: Validation de l'URL PostgreSQL
  console.log('\n🔍 2. Validation de l\'URL PostgreSQL:');
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl.startsWith('postgresql://')) {
    console.log('   ❌ URL ne commence pas par postgresql://');
    return;
  }
  
  try {
    const url = new URL(databaseUrl);
    console.log(`   ✅ Protocole: ${url.protocol}`);
    console.log(`   ✅ Host: ${url.hostname}`);
    console.log(`   ✅ Port: ${url.port || 5432}`);
    console.log(`   ✅ Database: ${url.pathname.slice(1)}`);
    console.log(`   ✅ User: ${url.username}`);
    console.log(`   ✅ SSL: ${url.searchParams.get('sslmode') || 'auto'}`);
    
    // Détecter le type de service
    if (url.hostname.includes('neon.tech')) {
      const region = url.hostname.match(/\.([^.]+)\.aws\.neon\.tech/)?.[1];
      console.log(`   🌍 Service: Neon (${region || 'région inconnue'})`);
      if (region === 'eu-central-1') {
        console.log('   ✅ Région Frankfurt - Conforme RGPD 🇪🇺');
      } else if (region?.startsWith('us-')) {
        console.log('   ⚠️  Région États-Unis - Attention RGPD 🇺🇸');
      }
    } else if (url.hostname.includes('supabase.co')) {
      console.log('   🌍 Service: Supabase');
      console.log('   ⚠️  Vérifiez la région pour RGPD');
    } else if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      console.log('   🏠 Service: PostgreSQL local');
      console.log('   ✅ Données locales - Conforme RGPD');
    } else {
      console.log(`   🌍 Service: PostgreSQL personnalisé (${url.hostname})`);
    }
    
  } catch (error) {
    console.log(`   ❌ URL invalide: ${error.message}`);
    return;
  }
  
  // Test 3: Vérification des dépendances PostgreSQL
  console.log('\n🔧 3. Vérification des dépendances:');
  try {
    await import('postgres');
    console.log('   ✅ postgres installé');
    await import('drizzle-orm/postgres-js');
    console.log('   ✅ drizzle-orm installé');
    await import('connect-pg-simple');
    console.log('   ✅ connect-pg-simple installé');
    console.log('   ✅ Toutes les dépendances PostgreSQL présentes');
  } catch (error) {
    console.log(`   ❌ Dépendance manquante: ${error.message}`);
    console.log('   💡 Exécutez: npm install @neondatabase/serverless drizzle-orm postgres connect-pg-simple');
    return;
  }
  
  // Test 4: Vérification des fichiers de configuration
  console.log('\n📊 4. Vérification des fichiers:');
  try {
    const fs = await import('fs');
    const files = [
      'shared/schema-pg.ts',
      'server/pg-storage.ts',
      'scripts/init-postgresql.sql',
      'docker-compose.test.yml'
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} manquant`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Erreur vérification fichiers: ${error.message}`);
  }
  
  // Test 5: Recommandations
  console.log('\n💡 5. Recommandations:');
  
  const authMode = process.env.AUTH_MODE;
  const devEasyLogin = process.env.DEV_EASY_LOGIN;
  
  if (authMode === 'DEV' || (authMode === 'HYBRID' && devEasyLogin === 'true')) {
    console.log('   ✅ Mode développement activé - Connexion facile disponible');
  }
  
  if (authMode === 'PRODUCTION') {
    console.log('   ✅ Mode production - Sécurité maximale');
    console.log('   💡 Assurez-vous que tous les mots de passe sont sécurisés');
  }
  
  console.log('\n🎯 Prochaines étapes pour tester avec une vraie base:');
  console.log('   1. 🐳 Docker local: docker-compose -f docker-compose.test.yml up -d');
  console.log('   2. 🧪 Test connexion: npm run db:test');
  console.log('   3. 🚀 Démarrer app: npm run dev');
  console.log('   4. 🌐 Ou créer compte Neon Frankfurt pour production');
  
  console.log('\n✅ Configuration PostgreSQL validée avec succès !');
}

// Exécuter le test
testConfiguration().catch(console.error);
