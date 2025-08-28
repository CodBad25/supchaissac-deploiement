import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const sessions = await sql`
        SELECT 
          id, 
          date, 
          start_time, 
          end_time, 
          subject, 
          class_name, 
          teacher_id,
          status,
          created_at
        FROM sessions 
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY date DESC, start_time ASC 
        LIMIT 100
      `;
      
      return res.status(200).json({
        success: true,
        sessions: sessions,
        count: sessions.length
      });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
