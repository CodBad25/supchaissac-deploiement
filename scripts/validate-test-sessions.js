import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';

async function validateTestSessions() {
  console.log('✅ Validation de sessions de test...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer les sessions en attente
    const sessions = await storage.getSessions();
    const pendingSessions = sessions.filter(s => s.status === 'PENDING_REVIEW');
    
    console.log(`📊 ${pendingSessions.length} sessions en attente de validation`);
    
    if (pendingSessions.length === 0) {
      console.log('❌ Aucune session à valider');
      return;
    }
    
    // Valider les 2 premières sessions
    const sessionsToValidate = pendingSessions.slice(0, 2);
    
    for (const session of sessionsToValidate) {
      console.log(`\n✅ Validation de la session ${session.id} (${session.teacherName} - ${session.type})`);
      
      await storage.updateSession(session.id, {
        status: 'VALIDATED',
        updatedBy: 'Secrétaire Test',
        updatedAt: new Date()
      });
      
      console.log(`   Status: PENDING_REVIEW → VALIDATED`);
    }
    
    // Afficher le résumé final
    const updatedSessions = await storage.getSessions();
    console.log('\n📊 Résumé des statuts:');
    
    const statusCounts = {};
    updatedSessions.forEach(session => {
      statusCounts[session.status] = (statusCounts[session.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} session(s)`);
    });
    
    console.log('\n✅ Validation terminée !');
    console.log('💡 Vous pouvez maintenant tester l\'archivage dans l\'interface secrétaire');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

validateTestSessions();
