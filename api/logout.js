// API Vercel - Route /api/logout
export default function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Pour une API stateless, on retourne simplement OK
    return res.status(200).json({ message: 'Déconnexion réussie' });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
