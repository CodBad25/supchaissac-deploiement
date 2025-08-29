import dotenv from 'dotenv';
import { IStorage } from './storage';
import { MemStorage } from './storage';
import { SqliteStorage } from './sqlite-storage';
import { PgStorage } from './pg-storage';

// Load environment variables
dotenv.config();

export async function createStorage(): Promise<IStorage> {
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log('🔧 Configuration du système de stockage...');
  console.log(`📊 Environnement: ${nodeEnv}`);
  
  // Si DATABASE_URL est définie et commence par postgresql://, utiliser PostgreSQL
  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    console.log('🐘 Tentative de connexion PostgreSQL...');
    try {
      const pgStorage = new PgStorage(databaseUrl);
      
      // Test de connexion
      await pgStorage.getSystemSettings();
      
      console.log('✅ PostgreSQL connecté avec succès');
      
      // Initialiser les données de test si nécessaire
      await pgStorage.initializeTestData();
      
      return pgStorage;
    } catch (error) {
      console.log('❌ Erreur PostgreSQL:', error.message);
      console.log('🔄 Basculement vers SQLite...');
    }
  }
  
  // Si DATABASE_URL est définie et commence par file:// ou sqlite://, utiliser SQLite
  if (databaseUrl && (databaseUrl.startsWith('file://') || databaseUrl.startsWith('sqlite://'))) {
    console.log('🗃️ Utilisation de SQLite...');
    const dbPath = databaseUrl.replace(/^(file|sqlite):\/\//, '');
    const sqliteStorage = new SqliteStorage(dbPath);
    
    // Initialiser les données de test
    await sqliteStorage.initializeTestData();
    
    console.log('✅ SQLite initialisé avec succès');
    return sqliteStorage;
  }
  
  // Par défaut, utiliser SQLite pour le développement
  if (nodeEnv === 'development') {
    console.log('🗃️ Utilisation de SQLite pour le développement...');
    const sqliteStorage = new SqliteStorage('./data/supchaissac.db');
    
    // Initialiser les données de test
    await sqliteStorage.initializeTestData();
    
    console.log('✅ SQLite initialisé avec succès');
    return sqliteStorage;
  }
  
  // Fallback vers SQLite au lieu de MemStorage
  console.log('🗃️ Fallback vers SQLite avec données existantes...');
  const sqliteStorage = new SqliteStorage('./data/supchaissac.db');

  // Initialiser les données de test
  await sqliteStorage.initializeTestData();

  console.log('✅ SQLite initialisé avec succès');
  return sqliteStorage;
}

export async function closeStorage(storage: IStorage): Promise<void> {
  if ('close' in storage && typeof storage.close === 'function') {
    await storage.close();
  }
}
