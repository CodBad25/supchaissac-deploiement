// API Vercel - Route /api/user
export default function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Pour Vercel, on utilise un token simple dans les headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const userData = JSON.parse(Buffer.from(token, 'base64').toString());
        return res.status(200).json(userData);
      } catch (e) {
        return res.status(401).json({ message: 'Token invalide' });
      }
    }
    return res.status(401).json({ message: 'Non connecté' });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
