import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getStorage } from "./storage-instance";
import { User as SelectUser } from "@shared/schema";
import bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// 🔐 Configuration du système d'authentification hybride
const AUTH_MODE = process.env.AUTH_MODE || "HYBRID"; // PRODUCTION, DEV, HYBRID
const DEV_EASY_LOGIN = process.env.DEV_EASY_LOGIN === "true";
const ADMIN_DEV_PASSWORD = process.env.ADMIN_DEV_PASSWORD || "DevAdmin2024!";

console.log(`🔐 Mode d'authentification: ${AUTH_MODE}`);
console.log(`🧪 Connexion facile développement: ${DEV_EASY_LOGIN ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`);

// 🔒 Fonction de hachage sécurisée (bcrypt)
export async function hashPassword(password: string) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// 🔍 Fonction de comparaison hybride (support ancien + nouveau format)
async function comparePasswords(supplied: string, stored: string) {
  // Support des deux formats : bcrypt (nouveau) et scrypt (ancien)
  if (stored.includes('.')) {
    // Format scrypt (ancien - pour compatibilité)
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    // Format bcrypt (nouveau - sécurisé)
    return await bcrypt.compare(supplied, stored);
  }
}

// 🛡️ Fonction pour vérifier l'accès admin de développement
function isAdminDevAccess(username: string, password: string): boolean {
  const isDevMode = AUTH_MODE === "DEV" || AUTH_MODE === "HYBRID";
  const isAdminDevUser = username === "admin.dev@supchaissac.local";
  const isCorrectPassword = password === ADMIN_DEV_PASSWORD;

  if (isDevMode && isAdminDevUser && isCorrectPassword) {
    console.log("🔓 Accès admin de développement accordé");
    return true;
  }
  return false;
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

        // 🛡️ VÉRIFICATION ADMIN DE DÉVELOPPEMENT
        if (isAdminDevAccess(username, password)) {
          // Vérifier si l'utilisateur admin dev existe déjà en base
          let adminDevUser = await storage.getUserByUsername("admin.dev@supchaissac.local");

          if (!adminDevUser) {
            // Créer l'utilisateur admin dev en base de données
            console.log("🔧 Création de l'utilisateur admin de développement...");
            try {
              adminDevUser = await storage.createUser({
                username: "admin.dev@supchaissac.local",
                name: "Admin Développement",
                role: "ADMIN",
                initials: "AD",
                signature: null,
                inPacte: false,
                password: await hashPassword(ADMIN_DEV_PASSWORD)
              });
              console.log("✅ Utilisateur admin dev créé avec ID:", adminDevUser.id);
            } catch (createError) {
              console.error("❌ Erreur création admin dev:", createError);
              return done(createError);
            }
          }

          console.log("✅ Connexion admin dev réussie:", adminDevUser.name, "ID:", adminDevUser.id);
          return done(null, adminDevUser);
        }

        // 🔍 VÉRIFICATION UTILISATEUR NORMAL
        const startTime = Date.now();
        console.log(`🔐 [AUTH] Tentative de connexion utilisateur: ${username}`);

        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`❌ [AUTH] Utilisateur non trouvé: ${username} (${Date.now() - startTime}ms)`);
          return done(null, false);
        }

        console.log(`👤 [AUTH] Utilisateur trouvé: ${user.name} (${user.role})`);

        // 🔐 VÉRIFICATION DU MOT DE PASSE
        let isPasswordValid = false;
        let authMethod = "";

        if (AUTH_MODE === "DEV") {
          // Mode développement : accepter "password123" pour tous
          isPasswordValid = password === "password123";
          authMethod = "DEV_MODE";
          console.log(`🧪 [AUTH] Mode développement activé`);
        } else if (AUTH_MODE === "PRODUCTION") {
          // Mode production : vérification sécurisée uniquement
          isPasswordValid = await comparePasswords(password, user.password);
          authMethod = "BCRYPT_SECURE";
          console.log(`🔒 [AUTH] Vérification sécurisée bcrypt`);
        } else { // HYBRID
          // Mode hybride intelligent
          if (DEV_EASY_LOGIN && password === "password123") {
            // Connexion facile pour le développement
            isPasswordValid = true;
            authMethod = "DEV_EASY";
            console.log(`🧪 [AUTH] Connexion développement facile pour: ${user.name}`);
          } else {
            // Vérification sécurisée (bcrypt)
            isPasswordValid = await comparePasswords(password, user.password);
            authMethod = "BCRYPT_HYBRID";
            console.log(`🔒 [AUTH] Vérification bcrypt en mode hybride`);
          }
        }

        const duration = Date.now() - startTime;

        if (isPasswordValid) {
          console.log(`✅ [AUTH] Connexion réussie: ${user.name} (${user.role}) via ${authMethod} (${duration}ms)`);
          return done(null, user);
        } else {
          console.log(`❌ [AUTH] Mot de passe incorrect pour: ${username} via ${authMethod} (${duration}ms)`);
          return done(null, false);
        }
      } catch (err) {
        console.error("❌ Erreur d'authentification:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("🔄 Sérialisation utilisateur:", user.id, user.username);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const storage = getStorage();
      console.log("🔄 Désérialisation utilisateur ID:", id);
      const user = await storage.getUser(id);

      if (!user) {
        console.log("❌ Utilisateur non trouvé pour ID:", id);
        return done(null, false);
      }

      console.log("✅ Utilisateur désérialisé:", user.username);
      done(null, user);
    } catch (err) {
      console.error("❌ Erreur désérialisation:", err);
      done(null, false); // Ne pas propager l'erreur, juste déconnecter
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

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Détruire complètement la session pour éviter les problèmes de désérialisation
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("❌ Erreur destruction session:", destroyErr);
        }
        res.clearCookie('connect.sid'); // Nom par défaut du cookie de session
        res.sendStatus(200);
      });
    });
  });

  // Route pour nettoyer les sessions corrompues (développement)
  app.post("/api/clear-session", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Erreur nettoyage session:", err);
        return res.status(500).json({ message: err.message });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Session cleared successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // 🛡️ ROUTES RGPD - Droits des personnes
  app.get("/api/rgpd/my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { rgpdCompliance } = await import("./rgpd-compliance");
      const userData = await rgpdCompliance.exportUserData(req.user!.id);
      res.json(userData);
    } catch (error) {
      console.error("❌ Erreur export données RGPD:", error);
      res.status(500).json({ error: "Erreur lors de l'export des données" });
    }
  });

  app.post("/api/rgpd/delete-my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Raison de suppression requise" });
      }

      const { rgpdCompliance } = await import("./rgpd-compliance");
      await rgpdCompliance.deleteUserData(req.user!.id, reason);

      // Déconnecter l'utilisateur après suppression
      req.logout((err) => {
        if (err) console.error("Erreur déconnexion:", err);
        res.json({ message: "Données supprimées avec succès" });
      });
    } catch (error) {
      console.error("❌ Erreur suppression données RGPD:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/rgpd/update-my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { rgpdCompliance } = await import("./rgpd-compliance");
      await rgpdCompliance.updateUserData(req.user!.id, req.body);
      res.json({ message: "Données mises à jour avec succès" });
    } catch (error) {
      console.error("❌ Erreur mise à jour données RGPD:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
