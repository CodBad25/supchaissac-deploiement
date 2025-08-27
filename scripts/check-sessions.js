import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';

async function checkSessions() {
  console.log('🔍 Vérification des sessions...');

  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer toutes les sessions
    const allSessions = await storage.getSessions();
    console.log(`📊 Total sessions dans la base: ${allSessions.length}`);
    
    if (allSessions.length > 0) {
      console.log('\n📋 Liste des sessions:');
      allSessions.forEach(session => {
        console.log(`   ${session.id}. ${session.teacherName} (ID: ${session.teacherId}) - ${session.type} - ${session.status} - ${session.date}`);
      });
      
      // Grouper par enseignant
      const sessionsByTeacher = {};
      allSessions.forEach(session => {
        if (!sessionsByTeacher[session.teacherId]) {
          sessionsByTeacher[session.teacherId] = [];
        }
        sessionsByTeacher[session.teacherId].push(session);
      });
      
      console.log('\n👨‍🏫 Sessions par enseignant:');
      Object.entries(sessionsByTeacher).forEach(([teacherId, sessions]) => {
        console.log(`   Enseignant ID ${teacherId} (${sessions[0].teacherName}): ${sessions.length} sessions`);
        sessions.forEach(s => console.log(`     - ${s.type} le ${s.date} (${s.status})`));
      });
      
      // Vérifier Sophie Martin spécifiquement
      const sophieSessions = allSessions.filter(s => s.teacherName.includes('Sophie') || s.teacherName.includes('MARTIN'));
      console.log(`\n🔍 Sessions de Sophie Martin: ${sophieSessions.length}`);
      sophieSessions.forEach(s => {
        console.log(`   - ${s.type} le ${s.date} (${s.status}) - ID: ${s.id}`);
      });
    } else {
      console.log('❌ Aucune session trouvée dans la base de données');
    }
    
    // Vérifier les utilisateurs
    const users = await storage.getUsers();
    console.log(`\n👥 Total utilisateurs: ${users.length}`);
    const teachers = users.filter(u => u.role === 'TEACHER');
    console.log(`👨‍🏫 Enseignants: ${teachers.length}`);
    
    const sophie = users.find(u => u.name.includes('Sophie'));
    if (sophie) {
      console.log(`\n🔍 Sophie Martin trouvée:`);
      console.log(`   ID: ${sophie.id}`);
      console.log(`   Username: ${sophie.username}`);
      console.log(`   Name: ${sophie.name}`);
      console.log(`   Role: ${sophie.role}`);
      
      // Ses sessions spécifiquement
      const sophieSessionsById = await storage.getSessionsByTeacher(sophie.id);
      console.log(`   Sessions: ${sophieSessionsById.length}`);
      sophieSessionsById.forEach(s => {
        console.log(`     - ${s.type} le ${s.date} (${s.status})`);
      });
    } else {
      console.log('❌ Sophie Martin non trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkSessions();
