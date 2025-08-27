// Vercel serverless function
import('../dist/server/index.js').then(module => {
  module.default || module;
}).catch(console.error);

export default async function handler(req, res) {
  try {
    const server = await import('../dist/server/index.js');
    return server.default(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
