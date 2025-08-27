#!/usr/bin/env node

/**
 * 🔒 Script de vérification de sécurité pour la production
 * Vérifie que toutes les configurations critiques sont correctes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('🔒 Audit de sécurité pour la production SupChaissac\n');

const checks = [];
let hasErrors = false;

// Fonction utilitaire pour ajouter un check
function addCheck(category, name, status, message, severity = 'error') {
  checks.push({ category, name, status, message, severity });
  if (!status && severity === 'error') {
    hasErrors = true;
  }
}

// 1. Vérification des fichiers de configuration
console.log('📁 Vérification des fichiers de configuration...');

const envProdPath = path.join(rootDir, '.env.production');
const envExists = fs.existsSync(envProdPath);
addCheck('Config', 'Fichier .env.production', envExists, 
  envExists ? '✅ Fichier présent' : '❌ Créez le fichier .env.production');

if (envExists) {
  const envContent = fs.readFileSync(envProdPath, 'utf8');
  
  // Vérification des variables critiques
  const criticalVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'NODE_ENV',
    'AUTH_MODE'
  ];
  
  criticalVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`);
    const hasPlaceholder = envContent.includes('CHANGEZ_MOI') || 
                          envContent.includes('VOTRE_') || 
                          envContent.includes('username:password');
    
    addCheck('Config', `Variable ${varName}`, hasVar && !hasPlaceholder,
      hasVar ? (hasPlaceholder ? '⚠️  Contient des placeholders' : '✅ Configurée') : '❌ Manquante');
  });
  
  // Vérification NODE_ENV
  const nodeEnvMatch = envContent.match(/NODE_ENV=(.+)/);
  const isProduction = nodeEnvMatch && nodeEnvMatch[1].trim() === 'production';
  addCheck('Config', 'NODE_ENV=production', isProduction,
    isProduction ? '✅ Configuré pour production' : '❌ Doit être "production"');
  
  // Vérification AUTH_MODE
  const authModeMatch = envContent.match(/AUTH_MODE=(.+)/);
  const isAuthProd = authModeMatch && authModeMatch[1].trim() === 'PRODUCTION';
  addCheck('Config', 'AUTH_MODE=PRODUCTION', isAuthProd,
    isAuthProd ? '✅ Mode production activé' : '❌ Doit être "PRODUCTION"');
}

// 2. Vérification des dépendances de production
console.log('📦 Vérification des dépendances...');

const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Vérification des scripts de production
  const hasStartScript = packageJson.scripts && packageJson.scripts.start;
  addCheck('Dependencies', 'Script start', !!hasStartScript,
    hasStartScript ? '✅ Script start présent' : '❌ Ajoutez un script start');
  
  const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  addCheck('Dependencies', 'Script build', !!hasBuildScript,
    hasBuildScript ? '✅ Script build présent' : '❌ Ajoutez un script build');
  
  // Vérification des dépendances critiques
  const criticalDeps = ['express', 'drizzle-orm', 'bcrypt', 'passport'];
  criticalDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    addCheck('Dependencies', `Dépendance ${dep}`, !!hasDep,
      hasDep ? '✅ Présente' : `❌ Manquante: npm install ${dep}`);
  });
}

// 3. Vérification de la structure des fichiers
console.log('🏗️  Vérification de la structure...');

const criticalFiles = [
  'server/index.ts',
  'server/routes.ts',
  'server/auth.ts',
  'shared/schema.ts',
  'client/src/App.tsx'
];

criticalFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const exists = fs.existsSync(filePath);
  addCheck('Structure', `Fichier ${file}`, exists,
    exists ? '✅ Présent' : `❌ Fichier manquant: ${file}`);
});

// 4. Vérification des permissions et sécurité
console.log('🛡️  Vérification de sécurité...');

// Vérification .gitignore
const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const ignoresEnv = gitignoreContent.includes('.env') || gitignoreContent.includes('.env.production');
  addCheck('Security', 'Fichiers .env ignorés par Git', ignoresEnv,
    ignoresEnv ? '✅ Fichiers .env dans .gitignore' : '❌ Ajoutez .env* à .gitignore');
}

// 5. Affichage des résultats
console.log('\n📊 Résultats de l\'audit:\n');

const categories = [...new Set(checks.map(c => c.category))];
categories.forEach(category => {
  console.log(`\n🔍 ${category}:`);
  checks.filter(c => c.category === category).forEach(check => {
    const icon = check.status ? '✅' : (check.severity === 'warning' ? '⚠️ ' : '❌');
    console.log(`  ${icon} ${check.name}: ${check.message}`);
  });
});

// 6. Résumé et recommandations
const totalChecks = checks.length;
const passedChecks = checks.filter(c => c.status).length;
const failedChecks = checks.filter(c => !c.status && c.severity === 'error').length;
const warnings = checks.filter(c => !c.status && c.severity === 'warning').length;

console.log('\n📈 Résumé:');
console.log(`  ✅ Réussis: ${passedChecks}/${totalChecks}`);
console.log(`  ❌ Échecs: ${failedChecks}`);
console.log(`  ⚠️  Avertissements: ${warnings}`);

if (hasErrors) {
  console.log('\n🚨 ATTENTION: Des problèmes critiques ont été détectés !');
  console.log('   Corrigez ces problèmes avant de déployer en production.');
  console.log('\n📋 Actions recommandées:');
  console.log('   1. Copiez .env.production vers .env');
  console.log('   2. Remplacez tous les placeholders par de vraies valeurs');
  console.log('   3. Générez un SESSION_SECRET fort: openssl rand -base64 32');
  console.log('   4. Configurez votre base de données PostgreSQL');
  console.log('   5. Testez la connexion: npm run health-check');
  
  process.exit(1);
} else {
  console.log('\n🎉 Félicitations ! Votre configuration semble prête pour la production.');
  console.log('\n🚀 Prochaines étapes:');
  console.log('   1. Testez l\'application: npm run build && npm start');
  console.log('   2. Vérifiez les logs: tail -f logs/app.log');
  console.log('   3. Configurez le monitoring et les sauvegardes');
  console.log('   4. Effectuez des tests de charge');
}
