import dotenv from 'dotenv';
import { IStorage } from './storage';
import { PgStorage } from './pg-storage';

// Load environment variables
dotenv.config();

export async function createStorage(): Promise<IStorage> {
  const databaseUrl = process.env.DATABASE_URL;

  console.log('🔧 Configuration du système de stockage...');
  console.log('🐘 NEON PostgreSQL UNIQUEMENT');

  if (!databaseUrl) {
    throw new Error('❌ DATABASE_URL manquante ! Configurez Neon PostgreSQL.');
  }

  if (!databaseUrl.startsWith('postgresql://')) {
    throw new Error('❌ DATABASE_URL doit être PostgreSQL (postgresql://...)');
  }

  console.log('🐘 Connexion à Neon PostgreSQL...');
  const pgStorage = new PgStorage(databaseUrl);

  // Test de connexion
  await pgStorage.initialize();

  console.log('✅ Neon PostgreSQL connecté avec succès');
  return pgStorage;
}

export async function closeStorage(storage: IStorage): Promise<void> {
  if ('close' in storage && typeof storage.close === 'function') {
    await storage.close();
  }
}
