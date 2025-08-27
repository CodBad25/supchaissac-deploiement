import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';

async function createNotificationsTable() {
  console.log('📬 Création de la table des notifications...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Créer la table des notifications
    await storage.db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );
    `);
    
    console.log('✅ Table notifications créée avec succès !');
    
    // Créer un index pour les performances
    await storage.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);
    
    await storage.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `);
    
    console.log('✅ Index créés avec succès !');
    
    // Tester l'insertion d'une notification
    console.log('\n🧪 Test d\'insertion d\'une notification...');
    
    await storage.db.execute(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (4, 'PENDING_DOCUMENTS', 'Pièces jointes requises', 'Votre déclaration nécessite des pièces jointes supplémentaires.')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Notification de test créée !');
    
    // Vérifier les notifications
    const result = await storage.db.execute(`
      SELECT n.*, u.name as user_name 
      FROM notifications n 
      JOIN users u ON n.user_id = u.id 
      ORDER BY n.created_at DESC 
      LIMIT 5;
    `);
    
    console.log('\n📋 Notifications récentes :');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`   ${row.id}. ${row.title} → ${row.user_name} (${row.is_read ? 'Lu' : 'Non lu'})`);
      });
    } else {
      console.log('   Aucune notification trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createNotificationsTable();
