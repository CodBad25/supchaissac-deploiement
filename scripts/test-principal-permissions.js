#!/usr/bin/env node

/**
 * 🔐 Test des permissions du principal
 * Teste que le principal a toutes les permissions de la secrétaire + validation
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log('🔐 Test des permissions PRINCIPAL\n');

// Recréer les utilisateurs avec les bons mots de passe
async function createPrincipalUser() {
  console.log('👤 Création/mise à jour du compte principal...');
  
  const script = `
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

const hashedPassword = await bcrypt.hash('principal123!', 12);

await db.update(users)
  .set({ password: hashedPassword })
  .where(eq(users.username, 'principal@example.com'));

console.log('✅ Mot de passe principal mis à jour');
await sql.end();
  `;
  
  // Écrire et exécuter le script temporaire
  const fs = await import('fs');
  fs.writeFileSync('temp-update-principal.js', script);
  
  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('node temp-update-principal.js', (error, stdout, stderr) => {
        if (error) reject(error);
        else {
          console.log(stdout);
          resolve();
        }
      });
    });
  } catch (error) {
    console.log('⚠️  Erreur mise à jour principal:', error.message);
  } finally {
    fs.unlinkSync('temp-update-principal.js');
  }
}

async function login() {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'principal@example.com',
      password: 'principal123!'
    })
  });
  
  if (response.ok) {
    const cookies = response.headers.get('set-cookie');
    const userData = await response.json();
    console.log(`✅ Connecté: ${userData.name} (${userData.role})`);
    return cookies;
  } else {
    console.log(`❌ Échec connexion: ${response.status}`);
    return null;
  }
}

async function createTestSession() {
  // Se connecter comme enseignant pour créer une session
  const teacherLogin = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'teacher1@example.com',
      password: 'teacher123!'
    })
  });
  
  if (!teacherLogin.ok) return null;
  
  const teacherCookies = teacherLogin.headers.get('set-cookie');
  const teacherData = await teacherLogin.json();
  
  const sessionData = {
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'M2',
    type: 'RCD',
    teacherId: teacherData.id,
    teacherName: teacherData.name,
    subject: 'Test Principal',
    className: 'CM1',
    replacedTeacherName: 'M. PRINCIPAL_TEST',
    comment: 'Session de test pour permissions principal'
  };
  
  const response = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': teacherCookies || ''
    },
    body: JSON.stringify(sessionData)
  });
  
  if (response.ok) {
    const session = await response.json();
    console.log(`✅ Session créée: ID ${session.id} (${session.status})`);
    return session.id;
  }
  return null;
}

async function testPrincipalPermissions(sessionId, cookies) {
  console.log('\n🔄 Test des permissions du principal:');
  
  // Test 1: Validation directe PENDING_REVIEW → VALIDATED
  console.log('\n1. Test: PENDING_REVIEW → VALIDATED (validation directe)');
  const test1 = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      status: 'VALIDATED',
      comment: 'Validation directe par le principal'
    })
  });
  
  if (test1.ok) {
    console.log('   ✅ Validation directe autorisée');
  } else {
    const error = await test1.text();
    console.log(`   ❌ Validation refusée: ${test1.status} - ${error}`);
  }
  
  // Test 2: Créer une nouvelle session pour tester le workflow normal
  const newSessionId = await createTestSession();
  if (newSessionId) {
    console.log('\n2. Test: PENDING_REVIEW → PENDING_VALIDATION (comme secrétaire)');
    const test2 = await fetch(`${BASE_URL}/api/sessions/${newSessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        status: 'PENDING_VALIDATION',
        comment: 'Principal agit comme secrétaire'
      })
    });
    
    if (test2.ok) {
      console.log('   ✅ Transition secrétaire autorisée');
      
      // Test 3: Puis validation
      console.log('\n3. Test: PENDING_VALIDATION → VALIDATED');
      const test3 = await fetch(`${BASE_URL}/api/sessions/${newSessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify({
          status: 'VALIDATED',
          comment: 'Validation finale par le principal'
        })
      });
      
      if (test3.ok) {
        console.log('   ✅ Validation finale autorisée');
      } else {
        console.log(`   ❌ Validation refusée: ${test3.status}`);
      }
    } else {
      console.log(`   ❌ Transition refusée: ${test2.status}`);
    }
  }
}

async function runTest() {
  try {
    await createPrincipalUser();
    
    const cookies = await login();
    if (!cookies) {
      console.log('🚨 Impossible de se connecter comme principal');
      return false;
    }
    
    const sessionId = await createTestSession();
    if (!sessionId) {
      console.log('🚨 Impossible de créer une session de test');
      return false;
    }
    
    await testPrincipalPermissions(sessionId, cookies);
    
    console.log('\n🎉 Tests des permissions principal terminés !');
    return true;
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error);
    return false;
  }
}

// Exécuter le test
runTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
