import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';

async function addNewStatuses() {
  console.log('🔧 Ajout des nouveaux statuts de session...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Exécuter les commandes SQL pour ajouter les nouveaux statuts
    console.log('📊 Ajout de PENDING_DOCUMENTS...');
    await storage.db.execute(`
      ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'PENDING_DOCUMENTS';
    `);
    
    console.log('📊 Ajout de READY_FOR_PAYMENT...');
    await storage.db.execute(`
      ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'READY_FOR_PAYMENT';
    `);
    
    console.log('✅ Nouveaux statuts ajoutés avec succès !');
    
    // Vérifier les statuts disponibles
    const result = await storage.db.execute(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'session_status'
      )
      ORDER BY enumlabel;
    `);
    
    console.log('\n📋 Statuts disponibles :');
    result.rows.forEach(row => {
      console.log(`   - ${row.enumlabel}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

addNewStatuses();
