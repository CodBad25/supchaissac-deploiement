#!/usr/bin/env node

/**
 * 🔄 Test du workflow complet SupChaissac
 * Teste: Création → Révision → Validation → Paiement
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Comptes pour le test (production)
const accounts = {
  teacher: { email: 'teacher1@example.com', password: 'teacher123!' },
  secretary: { email: 'secretary@example.com', password: 'secretary123!' },
  principal: { email: 'principal@example.com', password: 'principal123!' },
  admin: { email: 'admin@example.com', password: 'admin123!' }
};

let sessionCookies = {};

async function login(role) {
  const account = accounts[role];
  console.log(`🔐 Connexion ${role}: ${account.email}`);
  
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: account.email,
      password: account.password
    })
  });
  
  if (response.ok) {
    const cookies = response.headers.get('set-cookie');
    sessionCookies[role] = cookies;
    const userData = await response.json();
    console.log(`   ✅ Connecté: ${userData.name}`);
    return true;
  } else {
    console.log(`   ❌ Échec connexion: ${response.status}`);
    return false;
  }
}

async function createSession() {
  console.log('\n📝 Étape 1: Création de session par l\'enseignant');

  // D'abord récupérer les infos de l'enseignant connecté
  const userResponse = await fetch(`${BASE_URL}/api/user`, {
    headers: { 'Cookie': sessionCookies.teacher || '' }
  });

  if (!userResponse.ok) {
    console.log('   ❌ Impossible de récupérer les infos utilisateur');
    return null;
  }

  const user = await userResponse.json();
  console.log(`   👤 Enseignant connecté: ${user.name} (ID: ${user.id})`);

  const sessionData = {
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'M1',
    type: 'RCD',
    teacherId: user.id,
    teacherName: user.name,
    subject: 'Mathématiques',
    className: 'CM2',
    replacedTeacherName: 'M. DURAND',
    comment: 'Remplacement cours de mathématiques'
  };
  
  const response = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookies.teacher || ''
    },
    body: JSON.stringify(sessionData)
  });
  
  if (response.ok) {
    const session = await response.json();
    console.log(`   ✅ Session créée: ID ${session.id}`);
    console.log(`   📊 Statut: ${session.status}`);
    return session.id;
  } else {
    console.log(`   ❌ Échec création: ${response.status}`);
    const error = await response.text();
    console.log(`   📝 Erreur: ${error}`);
    return null;
  }
}

async function reviewSession(sessionId) {
  console.log('\n👀 Étape 2: Révision par le secrétaire');
  
  const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookies.secretary || ''
    },
    body: JSON.stringify({
      status: 'PENDING_VALIDATION',
      comment: 'Session vérifiée et conforme'
    })
  });
  
  if (response.ok) {
    const session = await response.json();
    console.log(`   ✅ Session révisée: ID ${session.id}`);
    console.log(`   📊 Statut: ${session.status}`);
    return true;
  } else {
    console.log(`   ❌ Échec révision: ${response.status}`);
    return false;
  }
}

async function validateSession(sessionId) {
  console.log('\n✅ Étape 3: Validation par le principal');
  
  const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookies.principal || ''
    },
    body: JSON.stringify({
      status: 'VALIDATED',
      comment: 'Session validée par la direction'
    })
  });
  
  if (response.ok) {
    const session = await response.json();
    console.log(`   ✅ Session validée: ID ${session.id}`);
    console.log(`   📊 Statut: ${session.status}`);
    return true;
  } else {
    console.log(`   ❌ Échec validation: ${response.status}`);
    return false;
  }
}

async function markAsPaid(sessionId) {
  console.log('\n💰 Étape 4: Marquage comme payée par le secrétaire');

  const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookies.secretary || ''
    },
    body: JSON.stringify({
      status: 'PAID',
      comment: 'Paiement effectué'
    })
  });
  
  if (response.ok) {
    const session = await response.json();
    console.log(`   ✅ Session marquée payée: ID ${session.id}`);
    console.log(`   📊 Statut: ${session.status}`);
    return true;
  } else {
    console.log(`   ❌ Échec marquage paiement: ${response.status}`);
    return false;
  }
}

async function checkSessionStatus(sessionId) {
  console.log('\n🔍 Vérification finale du statut');
  
  const response = await fetch(`${BASE_URL}/api/sessions`, {
    headers: {
      'Cookie': sessionCookies.admin || ''
    }
  });
  
  if (response.ok) {
    const sessions = await response.json();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      console.log(`   📊 Session ${sessionId}:`);
      console.log(`      - Statut: ${session.status}`);
      console.log(`      - Enseignant: ${session.teacherName}`);
      console.log(`      - Date: ${session.date}`);
      console.log(`      - Matière: ${session.subject}`);
      return session;
    } else {
      console.log(`   ❌ Session ${sessionId} non trouvée`);
      return null;
    }
  } else {
    console.log(`   ❌ Échec récupération sessions: ${response.status}`);
    return null;
  }
}

async function runWorkflowTest() {
  console.log('🔄 Test du workflow complet SupChaissac\n');
  console.log('📋 Étapes à tester:');
  console.log('   1. Création session (Enseignant)');
  console.log('   2. Révision (Secrétaire)');
  console.log('   3. Validation (Principal)');
  console.log('   4. Paiement (Secrétaire)');
  console.log('');
  
  try {
    // Connexions
    console.log('🔐 Connexions des utilisateurs:');
    const loginResults = await Promise.all([
      login('teacher'),
      login('secretary'),
      login('principal'),
      login('admin')
    ]);
    
    if (!loginResults.every(result => result)) {
      console.log('\n🚨 Échec des connexions. Arrêt du test.');
      return false;
    }
    
    // Test du workflow
    const sessionId = await createSession();
    if (!sessionId) return false;
    
    const reviewed = await reviewSession(sessionId);
    if (!reviewed) return false;
    
    const validated = await validateSession(sessionId);
    if (!validated) return false;
    
    const paid = await markAsPaid(sessionId);
    if (!paid) return false;
    
    // Vérification finale
    const finalSession = await checkSessionStatus(sessionId);
    
    if (finalSession && finalSession.status === 'PAID') {
      console.log('\n🎉 Workflow complet réussi !');
      console.log('✅ Toutes les étapes ont été validées.');
      console.log(`📊 Session ${sessionId} est maintenant payée.`);
      return true;
    } else {
      console.log('\n🚨 Le workflow n\'est pas complet.');
      return false;
    }
    
  } catch (error) {
    console.log(`\n💥 Erreur lors du test: ${error.message}`);
    return false;
  }
}

// Exécuter le test
runWorkflowTest().then(success => {
  console.log('\n📈 Résultat final:');
  if (success) {
    console.log('✅ Le workflow est prêt pour la production !');
    process.exit(0);
  } else {
    console.log('❌ Des problèmes ont été détectés dans le workflow.');
    console.log('🔧 Vérifiez les logs et corrigez les erreurs.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
