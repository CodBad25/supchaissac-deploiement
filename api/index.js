// API Vercel pour SupChaissac - Version simplifiée pour tests
export default function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  // Route health check
  if (method === 'GET' && url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      platform: 'Vercel',
      database_url_set: !!process.env.DATABASE_URL,
      session_secret_set: !!process.env.SESSION_SECRET
    });
  }

  // Route pour vérifier l'utilisateur connecté
  if (method === 'GET' && url === '/api/user') {
    // Pour Vercel, on ne peut pas maintenir de session
    // On retourne null pour forcer la connexion
    return res.status(401).json({ message: 'Non connecté' });
  }

  // Route de test pour les utilisateurs
  if (method === 'GET' && url === '/api/users') {
    return res.status(200).json({
      users: [
        { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
        { id: 2, email: 'secretary@example.com', name: 'Laure Martin', role: 'SECRETARY' },
        { id: 3, email: 'principal@example.com', name: 'Jean Dupont', role: 'PRINCIPAL' },
        { id: 4, email: 'teacher1@example.com', name: 'Sophie Martin', role: 'TEACHER' }
      ]
    });
  }

  // Route de connexion simplifiée
  if (method === 'POST' && url === '/api/login') {
    const { username, password, email } = req.body || {};
    const loginField = username || email; // Support des deux formats

    // Validation simple pour les tests
    if (loginField && password === 'password123') {
      const users = {
        'admin@example.com': { id: 1, name: 'Admin', role: 'ADMIN' },
        'secretary@example.com': { id: 2, name: 'Laure Martin', role: 'SECRETARY' },
        'principal@example.com': { id: 3, name: 'Jean Dupont', role: 'PRINCIPAL' },
        'teacher1@example.com': { id: 4, name: 'Sophie Martin', role: 'TEACHER' },
        'teacher2@example.com': { id: 5, name: 'Marie Petit', role: 'TEACHER' },
        'teacher3@example.com': { id: 6, name: 'Martin Dubois', role: 'TEACHER' },
        'teacher4@example.com': { id: 7, name: 'Philippe Garcia', role: 'TEACHER' }
      };

      const user = users[loginField];
      if (user) {
        return res.status(200).json({
          id: user.id,
          name: user.name,
          role: user.role,
          email: loginField,
          username: loginField
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Identifiants incorrects'
    });
  }

  // Route pour les sessions (données de test)
  if (method === 'GET' && url === '/api/sessions') {
    return res.status(200).json({
      sessions: [
        {
          id: 1,
          teacherId: 4,
          type: 'RCD',
          date: '2025-08-27',
          startTime: '08:00',
          endTime: '10:00',
          status: 'PENDING_REVIEW'
        }
      ]
    });
  }

  // Route par défaut
  return res.status(404).json({
    error: 'Route not found',
    method: method,
    url: url,
    available_routes: [
      'GET /api/health',
      'GET /api/users',
      'POST /api/login',
      'GET /api/sessions'
    ]
  });
}
