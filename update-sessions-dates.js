import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function updateSessionDates() {
  console.log('🔄 MISE À JOUR DES DATES DE SESSIONS');
  console.log('===================================');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Mettre à jour les sessions avec des dates récentes (cette semaine et la suivante)
    const today = new Date();
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
    
    console.log('📅 Mise à jour des sessions vers des dates récentes...');
    
    // Mettre à jour les sessions existantes avec des dates de cette semaine
    const result = await sql`
      UPDATE sessions
      SET date = CURRENT_DATE + (RANDOM() * 14)::INTEGER
      WHERE date::date < CURRENT_DATE
    `;
    
    console.log(`✅ ${result.length || 'Plusieurs'} sessions mises à jour`);
    
    // Vérifier les nouvelles dates
    const updatedSessions = await sql`
      SELECT date, COUNT(*) as count 
      FROM sessions 
      GROUP BY date 
      ORDER BY date
    `;
    
    console.log('📊 Répartition des sessions par date :');
    updatedSessions.forEach(row => {
      console.log(`  ${row.date}: ${row.count} sessions`);
    });
    
    console.log('✅ Mise à jour terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

updateSessionDates();
