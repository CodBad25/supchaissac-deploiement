#!/usr/bin/env node

/**
 * 🔑 Générateur de clé de session sécurisée
 * Génère une clé SESSION_SECRET forte pour la production
 */

import crypto from 'crypto';

console.log('🔑 Generation d\'une cle de session securisee...\n');

// Générer une clé de 32 bytes (256 bits) en base64
const sessionSecret = crypto.randomBytes(32).toString('base64');

console.log('✅ Cle generee avec succes !');
console.log('📋 Copiez cette cle dans votre fichier .env de production :\n');
console.log(`SESSION_SECRET="${sessionSecret}"`);
console.log('\n🔒 Cette cle est unique et securisee.');
console.log('⚠️  Ne partagez jamais cette cle et ne la commitez pas dans Git !');
console.log('\n📝 Prochaines etapes :');
console.log('   1. Copiez la ligne ci-dessus');
console.log('   2. Remplacez la ligne SESSION_SECRET dans .env.production');
console.log('   3. Ou creez un nouveau fichier .env avec cette valeur');

// Afficher aussi des informations sur la sécurité
console.log('\n🛡️  Informations de securite :');
console.log(`   - Longueur : ${sessionSecret.length} caracteres`);
console.log(`   - Entropie : 256 bits`);
console.log(`   - Format : Base64`);
console.log(`   - Genere le : ${new Date().toISOString()}`);
