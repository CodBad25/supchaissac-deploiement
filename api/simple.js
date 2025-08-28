// API simple pour tester la connexion DB
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
      // Test simple sans import externe
      const dbUrl = process.env.DATABASE_URL;
      
      if (!dbUrl) {
        return res.status(500).json({ 
          error: 'DATABASE_URL not configured',
          env: Object.keys(process.env).filter(k => k.includes('DATA'))
        });
      }
      
      // Simulons des données pour l'instant
      const mockUsers = [
        { id: 1, username: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
        { id: 2, username: 'teacher1@example.com', name: 'Sophie MARTIN', role: 'TEACHER' },
        { id: 3, username: 'secretary@example.com', name: 'Laure MARTIN', role: 'SECRETARY' },
        { id: 4, username: 'principal@example.com', name: 'Jean DUPONT', role: 'PRINCIPAL' }
      ];
      
      const mockSessions = [
        { id: 1, date: '2025-08-28', start_time: '08:00', end_time: '09:00', subject: 'Mathématiques', class_name: '6A', status: 'PENDING_REVIEW' },
        { id: 2, date: '2025-08-29', start_time: '10:00', end_time: '11:00', subject: 'Français', class_name: '5B', status: 'VALIDATED' }
      ];
      
      if (req.url.includes('/user')) {
        return res.status(200).json({
          success: true,
          users: mockUsers,
          count: mockUsers.length,
          source: 'mock_data'
        });
      }
      
      if (req.url.includes('/sessions')) {
        return res.status(200).json({
          success: true,
          sessions: mockSessions,
          count: mockSessions.length,
          source: 'mock_data'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'API simple fonctionne',
        database_configured: !!dbUrl,
        available_endpoints: ['/api/simple/user', '/api/simple/sessions']
      });
      
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ 
        error: 'Server error',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
