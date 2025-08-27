#!/usr/bin/env node

/**
 * 🔐 Test des permissions de la secrétaire
 * Teste les nouvelles permissions SECRETARY
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log('🔐 Test des permissions SECRETARY\n');

async function login() {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'secretary@example.com',
      password: 'secretary123!'
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

async function createTestSession(cookies) {
  console.log('\n📝 Création d\'une session de test...');
  
  // D'abord se connecter comme enseignant pour créer une session
  const teacherLogin = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'teacher1@example.com',
      password: 'teacher123!'
    })
  });
  
  if (!teacherLogin.ok) {
    console.log('❌ Impossible de se connecter comme enseignant');
    return null;
  }
  
  const teacherCookies = teacherLogin.headers.get('set-cookie');
  const teacherData = await teacherLogin.json();
  
  const sessionData = {
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'M1',
    type: 'RCD',
    teacherId: teacherData.id,
    teacherName: teacherData.name,
    subject: 'Test Permissions',
    className: 'CM2',
    replacedTeacherName: 'M. TEST',
    comment: 'Session de test pour permissions secrétaire'
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
  } else {
    console.log(`❌ Échec création: ${response.status}`);
    return null;
  }
}

async function testSecretaryTransitions(sessionId, cookies) {
  console.log('\n🔄 Test des transitions autorisées pour la secrétaire:');
  
  // Test 1: PENDING_REVIEW → PENDING_VALIDATION
  console.log('\n1. Test: PENDING_REVIEW → PENDING_VALIDATION');
  const test1 = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      status: 'PENDING_VALIDATION',
      comment: 'Vérification OK par secrétaire'
    })
  });
  
  if (test1.ok) {
    console.log('   ✅ Transition autorisée');
  } else {
    const error = await test1.text();
    console.log(`   ❌ Transition refusée: ${test1.status} - ${error}`);
  }
  
  // Test 2: PENDING_VALIDATION → PENDING_DOCUMENTS (non autorisé)
  console.log('\n2. Test: PENDING_VALIDATION → PENDING_DOCUMENTS (doit échouer)');
  const test2 = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      status: 'PENDING_DOCUMENTS',
      comment: 'Test transition non autorisée'
    })
  });
  
  if (test2.ok) {
    console.log('   ❌ Transition autorisée (ne devrait pas l\'être)');
  } else {
    console.log('   ✅ Transition correctement refusée');
  }
  
  // Test 3: Remettre en PENDING_REVIEW pour tester PENDING_DOCUMENTS
  console.log('\n3. Remise en PENDING_REVIEW pour test documents...');
  
  // D'abord se reconnecter comme enseignant pour remettre en PENDING_REVIEW
  const teacherLogin = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'teacher1@example.com',
      password: 'teacher123!'
    })
  });
  
  if (teacherLogin.ok) {
    const teacherCookies = teacherLogin.headers.get('set-cookie');
    
    // Créer une nouvelle session pour tester PENDING_DOCUMENTS
    const newSessionId = await createTestSession(cookies);
    if (newSessionId) {
      console.log('\n4. Test: PENDING_REVIEW → PENDING_DOCUMENTS');
      const test4 = await fetch(`${BASE_URL}/api/sessions/${newSessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify({
          status: 'PENDING_DOCUMENTS',
          comment: 'Il manque la liste des élèves'
        })
      });
      
      if (test4.ok) {
        console.log('   ✅ Transition PENDING_DOCUMENTS autorisée');
        
        // Test 5: PENDING_DOCUMENTS → PENDING_VALIDATION
        console.log('\n5. Test: PENDING_DOCUMENTS → PENDING_VALIDATION');
        const test5 = await fetch(`${BASE_URL}/api/sessions/${newSessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies || ''
          },
          body: JSON.stringify({
            status: 'PENDING_VALIDATION',
            comment: 'Documents reçus, vérification OK'
          })
        });
        
        if (test5.ok) {
          console.log('   ✅ Transition autorisée');
        } else {
          console.log(`   ❌ Transition refusée: ${test5.status}`);
        }
      } else {
        console.log(`   ❌ Transition refusée: ${test4.status}`);
      }
    }
  }
}

async function runTest() {
  try {
    const cookies = await login();
    if (!cookies) {
      console.log('🚨 Impossible de se connecter');
      return false;
    }
    
    const sessionId = await createTestSession(cookies);
    if (!sessionId) {
      console.log('🚨 Impossible de créer une session de test');
      return false;
    }
    
    await testSecretaryTransitions(sessionId, cookies);
    
    console.log('\n🎉 Tests des permissions secrétaire terminés !');
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
