// API Vercel - Route /api/login
export default function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Utilisateurs de test
    const users = {
      'admin@example.com': {
        id: 1,
        name: 'Administrateur',
        role: 'ADMIN',
        password: 'password123'
      },
      'secretary@example.com': {
        id: 2,
        name: 'Secrétaire',
        role: 'SECRETARY',
        password: 'password123'
      },
      'principal@example.com': {
        id: 3,
        name: 'Principal',
        role: 'PRINCIPAL',
        password: 'password123'
      },
      'teacher1@example.com': {
        id: 4,
        name: 'Enseignant 1',
        role: 'TEACHER',
        password: 'password123'
      }
    };

    if (!username || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const loginField = username.toLowerCase();
    const user = users[loginField];
    
    if (user && user.password === password) {
      const userData = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: loginField,
        username: loginField
      };
      
      // Créer un token simple (base64)
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      
      return res.status(200).json({
        ...userData,
        token: token
      });
    }

    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
