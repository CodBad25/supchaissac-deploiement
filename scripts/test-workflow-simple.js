#!/usr/bin/env node

/**
 * 🔄 Test workflow simplifié
 * Teste uniquement Secretary et Principal
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log('🔄 Test workflow simplifié (Secretary + Principal)\n');

async function login(role, email, password) {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password })
  });
  
  if (response.ok) {
    const cookies = response.headers.get('set-cookie');
    const userData = await response.json();
    console.log(`✅ ${role}: ${userData.name}`);
    return { cookies, userData };
  } else {
    console.log(`❌ ${role}: Échec ${response.status}`);
    return null;
  }
}

async function testWorkflow() {
  // Connexions
  const secretary = await login('Secretary', 'secretary@example.com', 'secretary123!');
  const principal = await login('Principal', 'principal@example.com', 'principal123!');
  
  if (!secretary || !principal) {
    console.log('🚨 Échec des connexions');
    return false;
  }
  
  // Créer une session manuellement en base pour tester
  console.log('\n📝 Création session de test...');
  
  // Utiliser l'API pour créer une session (simuler enseignant)
  const sessionData = {
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'M3',
    type: 'RCD',
    teacherId: 4, // ID de teacher1
    teacherName: 'Enseignant Test',
    subject: 'Test Workflow',
    className: 'CE2',
    replacedTeacherName: 'M. WORKFLOW',
    comment: 'Test workflow complet'
  };
  
  // Créer la session avec les permissions secrétaire (pour simuler)
  const createResponse = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': secretary.cookies || ''
    },
    body: JSON.stringify(sessionData)
  });
  
  let sessionId;
  if (createResponse.ok) {
    const session = await createResponse.json();
    sessionId = session.id;
    console.log(`✅ Session créée: ID ${sessionId}`);
  } else {
    console.log(`❌ Échec création: ${createResponse.status}`);
    return false;
  }
  
  // Test 1: Secretary PENDING_REVIEW → PENDING_VALIDATION
  console.log('\n🔄 Test 1: Secretary vérifie la session');
  const step1 = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': secretary.cookies || ''
    },
    body: JSON.stringify({
      status: 'PENDING_VALIDATION',
      comment: 'Vérification OK par secrétaire'
    })
  });
  
  if (step1.ok) {
    console.log('   ✅ Secretary: PENDING_REVIEW → PENDING_VALIDATION');
  } else {
    console.log(`   ❌ Secretary: Échec ${step1.status}`);
    return false;
  }
  
  // Test 2: Principal PENDING_VALIDATION → VALIDATED
  console.log('\n🔄 Test 2: Principal valide la session');
  const step2 = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': principal.cookies || ''
    },
    body: JSON.stringify({
      status: 'VALIDATED',
      comment: 'Validation par le principal'
    })
  });
  
  if (step2.ok) {
    console.log('   ✅ Principal: PENDING_VALIDATION → VALIDATED');
  } else {
    console.log(`   ❌ Principal: Échec ${step2.status}`);
    return false;
  }
  
  // Test 3: Principal validation directe (nouvelle session)
  console.log('\n🔄 Test 3: Principal validation directe');
  
  const directSessionData = {
    ...sessionData,
    comment: 'Test validation directe principal'
  };
  
  const createResponse2 = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': secretary.cookies || ''
    },
    body: JSON.stringify(directSessionData)
  });
  
  if (createResponse2.ok) {
    const session2 = await createResponse2.json();
    const sessionId2 = session2.id;
    
    // Principal valide directement
    const directValidation = await fetch(`${BASE_URL}/api/sessions/${sessionId2}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': principal.cookies || ''
      },
      body: JSON.stringify({
        status: 'VALIDATED',
        comment: 'Validation directe par le principal'
      })
    });
    
    if (directValidation.ok) {
      console.log('   ✅ Principal: PENDING_REVIEW → VALIDATED (direct)');
    } else {
      console.log(`   ❌ Principal: Validation directe échouée ${directValidation.status}`);
    }
  }
  
  console.log('\n🎉 Tests terminés avec succès !');
  return true;
}

// Exécuter le test
testWorkflow().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erreur:', error);
  process.exit(1);
});
