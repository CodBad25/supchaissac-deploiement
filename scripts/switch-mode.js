#!/usr/bin/env node

// 🎛️ Script de basculement entre modes développement et production
// Usage: node scripts/switch-mode.js [dev|prod|hybrid]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(process.cwd(), '.env');

const MODES = {
  dev: {
    AUTH_MODE: 'DEV',
    DEV_EASY_LOGIN: 'true',
    NODE_ENV: 'development',
    DATABASE_URL: 'sqlite://./data/supchaissac.db',
    description: '🧪 Mode développement - Connexion facile avec password123'
  },
  hybrid: {
    AUTH_MODE: 'HYBRID',
    DEV_EASY_LOGIN: 'true',
    NODE_ENV: 'development',
    DATABASE_URL: 'sqlite://./data/supchaissac.db',
    description: '🔄 Mode hybride - password123 + mots de passe sécurisés'
  },
  prod: {
    AUTH_MODE: 'PRODUCTION',
    DEV_EASY_LOGIN: 'false',
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://supchaissac_user:PASSWORD@localhost:5432/supchaissac_prod',
    description: '🏭 Mode production - Sécurité maximale, PostgreSQL requis'
  }
};

function updateEnvFile(mode) {
  const config = MODES[mode];
  if (!config) {
    console.error('❌ Mode invalide. Utilisez: dev, hybrid, ou prod');
    process.exit(1);
  }

  let envContent = '';
  
  // Lire le fichier .env existant ou créer à partir de .env.example
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  } else if (fs.existsSync('.env.example')) {
    envContent = fs.readFileSync('.env.example', 'utf8');
    console.log('📋 Création du fichier .env à partir de .env.example');
  } else {
    console.error('❌ Aucun fichier .env ou .env.example trouvé');
    process.exit(1);
  }

  // Mettre à jour les variables
  Object.entries(config).forEach(([key, value]) => {
    if (key === 'description') return;
    
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  // Sauvegarder
  fs.writeFileSync(ENV_FILE, envContent);
  
  console.log(`✅ Configuration mise à jour: ${config.description}`);
  console.log(`📁 Fichier: ${ENV_FILE}`);
  
  // Afficher les changements importants
  console.log('\n🔧 Configuration active:');
  Object.entries(config).forEach(([key, value]) => {
    if (key !== 'description') {
      console.log(`   ${key}=${value}`);
    }
  });

  if (mode === 'prod') {
    console.log('\n⚠️  ATTENTION - Mode production:');
    console.log('   • Configurez PostgreSQL avant de démarrer');
    console.log('   • Changez DATABASE_URL avec vos vraies credentials');
    console.log('   • Générez une SESSION_SECRET forte');
    console.log('   • Tous les comptes de test seront désactivés');
  }

  if (mode === 'dev' || mode === 'hybrid') {
    console.log('\n🧪 Mode développement actif:');
    console.log('   • Connexion avec password123 pour tous les comptes');
    console.log('   • Admin dev: admin.dev@supchaissac.local / DevAdmin2024!');
    console.log('   • Base SQLite locale utilisée');
  }
}

function showCurrentMode() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ Aucun fichier .env trouvé');
    return;
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const authMode = envContent.match(/^AUTH_MODE=(.*)$/m)?.[1] || 'NON_DÉFINI';
  const devEasyLogin = envContent.match(/^DEV_EASY_LOGIN=(.*)$/m)?.[1] || 'NON_DÉFINI';
  const nodeEnv = envContent.match(/^NODE_ENV=(.*)$/m)?.[1] || 'NON_DÉFINI';

  console.log('📊 Configuration actuelle:');
  console.log(`   AUTH_MODE=${authMode}`);
  console.log(`   DEV_EASY_LOGIN=${devEasyLogin}`);
  console.log(`   NODE_ENV=${nodeEnv}`);

  // Déterminer le mode
  let currentMode = 'inconnu';
  if (authMode === 'DEV') currentMode = 'dev';
  else if (authMode === 'PRODUCTION') currentMode = 'prod';
  else if (authMode === 'HYBRID') currentMode = 'hybrid';

  if (MODES[currentMode]) {
    console.log(`\n${MODES[currentMode].description}`);
  }
}

function showHelp() {
  console.log('🎛️  Script de basculement de mode SupChaissac\n');
  console.log('Usage:');
  console.log('  node scripts/switch-mode.js [mode]\n');
  console.log('Modes disponibles:');
  Object.entries(MODES).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(8)} - ${config.description}`);
  });
  console.log('\nCommandes spéciales:');
  console.log('  status   - Afficher la configuration actuelle');
  console.log('  help     - Afficher cette aide');
}

// Main
const mode = process.argv[2];

if (!mode || mode === 'help') {
  showHelp();
} else if (mode === 'status') {
  showCurrentMode();
} else if (MODES[mode]) {
  updateEnvFile(mode);
} else {
  console.error(`❌ Mode "${mode}" inconnu`);
  showHelp();
  process.exit(1);
}
