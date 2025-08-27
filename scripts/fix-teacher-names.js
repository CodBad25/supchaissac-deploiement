import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';

async function fixTeacherNames() {
  console.log('🔧 Correction des noms d\'enseignants dans les sessions...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer toutes les sessions
    const sessions = await storage.getSessions();
    console.log(`📊 ${sessions.length} sessions à vérifier`);
    
    // Récupérer tous les utilisateurs
    const users = await storage.getUsers();
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.id, user.name);
      userMap.set(user.username, user.name); // Pour les cas où teacherName = email
    });
    
    let updatedCount = 0;
    
    for (const session of sessions) {
      let newTeacherName = null;
      
      // Si teacherName ressemble à un email, le remplacer par le vrai nom
      if (session.teacherName.includes('@')) {
        // Chercher par email
        newTeacherName = userMap.get(session.teacherName);
      } else if (session.teacherId) {
        // Vérifier si le nom correspond à l'ID
        const correctName = userMap.get(session.teacherId);
        if (correctName && correctName !== session.teacherName) {
          newTeacherName = correctName;
        }
      }
      
      if (newTeacherName) {
        console.log(`   Mise à jour session ${session.id}: "${session.teacherName}" → "${newTeacherName}"`);
        
        await storage.updateSession(session.id, {
          teacherName: newTeacherName
        });
        
        updatedCount++;
      }
    }
    
    console.log(`✅ ${updatedCount} sessions mises à jour`);
    
    // Vérification finale
    const updatedSessions = await storage.getSessions();
    console.log('\n📋 Sessions après correction:');
    updatedSessions.forEach(session => {
      console.log(`   ${session.id}. ${session.teacherName} (ID: ${session.teacherId}) - ${session.type} - ${session.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixTeacherNames();
