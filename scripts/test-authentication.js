#!/usr/bin/env node

/**
 * 🔐 Test d'authentification automatisé
 * Teste les connexions pour tous les rôles
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log('🔐 Test d\'authentification SupChaissac\n');

// Comptes de test à vérifier (production)
const testAccounts = [
  { email: 'admin@example.com', password: 'admin123!', role: 'ADMIN', name: 'Admin' },
  { email: 'principal@example.com', password: 'principal123!', role: 'PRINCIPAL', name: 'Principal' },
  { email: 'secretary@example.com', password: 'secretary123!', role: 'SECRETARY', name: 'Secrétaire' },
  { email: 'teacher1@example.com', password: 'teacher123!', role: 'TEACHER', name: 'Enseignant 1' }
];

async function testLogin(account) {
  try {
    console.log(`🔍 Test connexion: ${account.name} (${account.role})`);
    
    // Test de connexion
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: account.email,
        password: account.password
      })
    });

    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log(`   ✅ Connexion réussie: ${userData.name} (${userData.role})`);
      
      // Récupérer les cookies de session
      const cookies = loginResponse.headers.get('set-cookie');
      
      // Test d'accès aux données utilisateur
      const userResponse = await fetch(`${BASE_URL}/api/user`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      if (userResponse.ok) {
        console.log(`   ✅ Session valide`);
        
        // Test de déconnexion
        const logoutResponse = await fetch(`${BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Cookie': cookies || ''
          }
        });
        
        if (logoutResponse.ok) {
          console.log(`   ✅ Déconnexion réussie`);
          return true;
        } else {
          console.log(`   ❌ Échec déconnexion`);
          return false;
        }
      } else {
        console.log(`   ❌ Session invalide`);
        return false;
      }
    } else {
      console.log(`   ❌ Échec connexion: ${loginResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    return false;
  }
}

async function testServerHealth() {
  try {
    console.log('🏥 Test de santé du serveur...');
    const response = await fetch(`${BASE_URL}/api/user`);
    
    if (response.status === 401) {
      console.log('   ✅ Serveur actif (401 attendu sans authentification)');
      return true;
    } else {
      console.log(`   ⚠️  Réponse inattendue: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Serveur inaccessible: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`🌐 URL de test: ${BASE_URL}\n`);
  
  // Test de santé du serveur
  const serverOk = await testServerHealth();
  if (!serverOk) {
    console.log('\n🚨 Le serveur n\'est pas accessible. Démarrez-le avec: npm run dev');
    process.exit(1);
  }
  
  console.log('\n🔐 Tests d\'authentification:\n');
  
  let successCount = 0;
  let totalTests = testAccounts.length;
  
  for (const account of testAccounts) {
    const success = await testLogin(account);
    if (success) successCount++;
    console.log(''); // Ligne vide entre les tests
  }
  
  // Résumé
  console.log('📊 Résultats:');
  console.log(`   ✅ Réussis: ${successCount}/${totalTests}`);
  console.log(`   ❌ Échecs: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 Tous les tests d\'authentification ont réussi !');
    console.log('✅ L\'authentification est prête pour la production.');
    return true;
  } else {
    console.log('\n🚨 Certains tests ont échoué.');
    console.log('🔧 Vérifiez la configuration et les comptes utilisateurs.');
    return false;
  }
}

// Exécuter les tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erreur lors des tests:', error);
  process.exit(1);
});
