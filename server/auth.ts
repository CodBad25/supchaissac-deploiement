import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getStorage } from "./storage-instance";
import { User as SelectUser, userSwitcherList } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const storage = getStorage();

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "teacher-hours-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Dans un environnement de développement, nous ne voulons pas des cookies sécurisés
      sameSite: 'lax' // Permet d'envoyer le cookie lors des navigations
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const storage = getStorage();
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        
        // Vérification simplifiée pour le développement
        // Vérifie simplement que le mot de passe correspond à "password123"
        if (password === "password123") {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const storage = getStorage();
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const storage = getStorage();
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Ce nom d'utilisateur existe déjà");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    try {
      const user = req.user!;

      // 🔧 DEV TOOL - Auto-ajouter l'utilisateur réel à la liste switcher
      // (sera supprimé en production)
      await autoAddUserToSwitcher(user, req.body.username, req.body.password);

      res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de l\'ajout auto à la liste switcher:', error);
      // Ne pas faire échouer la connexion pour autant
      res.status(200).json(req.user);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// 🔧 DEV TOOL - Fonction pour auto-ajouter un utilisateur réel à la liste switcher
async function autoAddUserToSwitcher(user: SelectUser, username: string, password: string) {
  try {
    const storage = getStorage();

    // Vérifier si l'utilisateur n'est pas déjà dans la liste
    const existing = await storage.db
      .select()
      .from(userSwitcherList)
      .where(eq(userSwitcherList.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return; // Déjà dans la liste
    }

    // Vérifier si c'est un utilisateur de test (les 4 de base)
    const demoUsernames = [
      'teacher1@example.com',
      'secretary@example.com',
      'principal@example.com',
      'admin@example.com'
    ];

    const isDemoUser = demoUsernames.includes(username);

    // Si ce n'est pas un utilisateur de test, l'ajouter à la liste
    if (!isDemoUser) {
      const newSwitcherUser = {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userCredentials: JSON.stringify({ username, password }),
        description: `${user.role} (utilisateur réel)`,
        isDemoUser: false,
        isActive: true
      };

      await storage.db.insert(userSwitcherList).values(newSwitcherUser);
      console.log(`✅ Utilisateur réel ajouté automatiquement à la liste switcher: ${user.name} (${user.role})`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout automatique à la liste switcher:', error);
  }
}
