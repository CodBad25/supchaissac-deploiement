// Wrapper API pour Vercel - SupChaissac
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

// Import du serveur principal (compilé)
let app;

try {
  // Créer une instance Express pour Vercel
  app = express();

  // Configuration middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'vercel-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Routes de base
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      platform: 'Vercel'
    });
  });

  // Import et configuration des routes principales
  // (Ici on devrait importer le serveur principal mais pour Vercel
  // on utilise une approche simplifiée)

} catch (error) {
  console.error('Erreur lors de l\'initialisation du serveur:', error);
}

export default function handler(req, res) {
  if (!app) {
    return res.status(500).json({
      error: 'Serveur non initialisé',
      timestamp: new Date().toISOString()
    });
  }

  // Utiliser Express comme handler Vercel
  return app(req, res);
}
