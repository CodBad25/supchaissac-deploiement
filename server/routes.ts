import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { initializeStorage, getStorage } from "./storage-instance";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSessionSchema, insertTeacherSetupSchema, insertSystemSettingSchema } from "@shared/schema";
import userSwitcherRouter from "./user-switcher-api";

function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage
  await initializeStorage();
  const storage = getStorage();

  // Set up authentication routes
  setupAuth(app);

  // 🔧 DEV TOOL - User Switcher API (will be removed in production)
  app.use("/api/user-switcher", userSwitcherRouter);

  // API routes
  // Sessions
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      let sessions;
      
      // Filter sessions based on user role
      if (req.user!.role === "TEACHER") {
        sessions = await storage.getSessionsByTeacher(req.user!.id);
      } else {
        sessions = await storage.getSessions();
      }
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });
  
  // Route spécifique pour récupérer les sessions d'un enseignant par son ID
  app.get("/api/sessions/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      
      // Vérifier les permissions
      if (req.user!.role === "TEACHER" && req.user!.id !== teacherId) {
        return res.status(403).json({ error: "Un enseignant ne peut consulter que ses propres sessions" });
      }
      
      const sessions = await storage.getSessionsByTeacher(teacherId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Impossible de récupérer les sessions de cet enseignant" });
    }
  });

  app.get("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const session = await storage.getSessionById(parseInt(req.params.id));
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Teachers can only access their own sessions
      if (req.user!.role === "TEACHER" && session.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });
  
  // Route pour vérifier si une session est toujours éditable
  app.get("/api/sessions/:id/edit-status", isAuthenticated, async (req, res) => {
    try {
      const session = await storage.getSessionById(parseInt(req.params.id));
      
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }
      
      // Teachers can only check their own sessions
      if (req.user!.role === "TEACHER" && session.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Accès refusé" });
      }
      
      // Si ce n'est pas un enseignant ou si le statut n'est pas PENDING_REVIEW, pas besoin de vérifier le délai
      if (req.user!.role !== "TEACHER" || session.status !== "PENDING_REVIEW") {
        return res.json({
          isEditable: req.user!.role !== "TEACHER" || session.status === "PENDING_REVIEW",
          editWindow: null,
          elapsed: null,
          remaining: null
        });
      }
      
      // Vérifier si le temps de modification n'a pas expiré
      const editWindowSetting = await storage.getSystemSettingByKey("SESSION_EDIT_WINDOW");
      const editWindowMinutes = editWindowSetting ? parseInt(editWindowSetting.value) : 60; // Par défaut 60 minutes
      const creationTime = new Date(session.createdAt).getTime();
      const currentTime = new Date().getTime();
      const diffMinutes = Math.floor((currentTime - creationTime) / (1000 * 60));
      const remainingMinutes = Math.max(0, editWindowMinutes - diffMinutes);
      
      return res.json({
        isEditable: diffMinutes <= editWindowMinutes,
        editWindow: editWindowMinutes,
        elapsed: diffMinutes,
        remaining: remainingMinutes
      });
    } catch (error) {
      res.status(500).json({ error: "Impossible de vérifier le statut d'édition" });
    }
  });

  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      // Validate input
      const validatedData = insertSessionSchema.parse(req.body);
      
      // Teachers can only create sessions for themselves
      if (req.user!.role === "TEACHER" && validatedData.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Cannot create sessions for other teachers" });
      }
      
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.patch("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Check permissions based on role
      if (req.user!.role === "TEACHER") {
        // Teachers can only update their own sessions that are in PENDING_REVIEW status
        if (session.teacherId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (session.status !== "PENDING_REVIEW") {
          return res.status(403).json({ error: "Cannot update sessions that are already in review" });
        }
      } else if (req.user!.role === "ADMIN") {
        // Admins can view but not change session status (reserved for PRINCIPAL/SECRETARY)
        if (req.body.status && req.body.status !== session.status) {
          return res.status(403).json({ 
            error: "Les administrateurs ne peuvent pas changer le statut des séances. Cette fonctionnalité est réservée à la direction et au secrétariat." 
          });
        }
        
        // Vérifier si le temps de modification n'a pas expiré
        const editWindowSetting = await storage.getSystemSettingByKey("SESSION_EDIT_WINDOW");
        if (editWindowSetting) {
          const editWindowMinutes = parseInt(editWindowSetting.value);
          const creationTime = new Date(session.createdAt).getTime();
          const currentTime = new Date().getTime();
          const diffMinutes = Math.floor((currentTime - creationTime) / (1000 * 60));
          
          if (diffMinutes > editWindowMinutes) {
            return res.status(403).json({ 
              error: "Le délai de modification a expiré", 
              details: {
                editWindow: editWindowMinutes,
                elapsed: diffMinutes,
                remaining: 0
              }
            });
          }
        }
      }
      
      const updatedSession = await storage.updateSession(sessionId, {
        ...req.body,
        updatedBy: req.user!.name
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Check permissions
      if (req.user!.role === "TEACHER") {
        // Teachers can only delete their own sessions that are in PENDING_REVIEW
        if (session.teacherId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (session.status !== "PENDING_REVIEW") {
          return res.status(403).json({ error: "Cannot delete sessions that are already in review" });
        }
      } else if (req.user!.role === "ADMIN") {
        // Administrators cannot delete sessions that are already validated
        if (session.status === "VALIDATED") {
          return res.status(403).json({ 
            error: "Les administrateurs ne peuvent pas supprimer des séances déjà validées. Cette opération est réservée à la direction." 
          });
        }
        
        // Vérifier si le temps de modification n'a pas expiré
        const editWindowSetting = await storage.getSystemSettingByKey("SESSION_EDIT_WINDOW");
        if (editWindowSetting) {
          const editWindowMinutes = parseInt(editWindowSetting.value);
          const creationTime = new Date(session.createdAt).getTime();
          const currentTime = new Date().getTime();
          const diffMinutes = Math.floor((currentTime - creationTime) / (1000 * 60));
          
          if (diffMinutes > editWindowMinutes) {
            return res.status(403).json({ 
              error: "Le délai de modification a expiré", 
              details: {
                editWindow: editWindowMinutes,
                elapsed: diffMinutes,
                remaining: 0
              }
            });
          }
        }
      }
      
      await storage.deleteSession(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Teacher setup routes
  app.get("/api/teacher-setup", isAuthenticated, async (req, res) => {
    try {
      const teacherId = req.user!.id;
      let setup = await storage.getTeacherSetup(teacherId);
      
      if (!setup) {
        // Create a default setup if none exists
        setup = await storage.createTeacherSetup({
          teacherId,
          inPacte: false
        });
      }
      
      res.json(setup);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teacher setup" });
    }
  });

  app.patch("/api/teacher-setup", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role !== "TEACHER") {
        return res.status(403).json({ error: "Only teachers can update their setup" });
      }
      
      const teacherId = req.user!.id;
      let setup = await storage.getTeacherSetup(teacherId);
      
      if (!setup) {
        // Create a new setup if none exists
        setup = await storage.createTeacherSetup({
          teacherId,
          ...req.body
        });
      } else {
        // Update existing setup
        setup = await storage.updateTeacherSetup(teacherId, req.body);
      }
      
      res.json(setup);
    } catch (error) {
      res.status(500).json({ error: "Failed to update teacher setup" });
    }
  });

  // User profile routes
  app.patch("/api/user/signature", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { signature } = req.body;
      
      if (!signature) {
        return res.status(400).json({ error: "Signature is required" });
      }
      
      const user = await storage.updateUser(userId, { signature });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update signature" });
    }
  });

  // System settings routes (admin only)
  function isAdmin(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated() && (req.user!.role === "ADMIN" || req.user!.username === "admin@example.com")) {
      return next();
    }
    res.status(403).json({ error: "Accès réservé aux administrateurs" });
  }

  app.get("/api/system-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Impossible de récupérer les paramètres système" });
    }
  });

  app.get("/api/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const setting = await storage.getSystemSettingByKey(req.params.key);
      
      if (!setting) {
        return res.status(404).json({ error: "Paramètre non trouvé" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Impossible de récupérer le paramètre" });
    }
  });

  app.patch("/api/system-settings/:key", isAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ error: "La valeur du paramètre est requise" });
      }
      
      const setting = await storage.getSystemSettingByKey(req.params.key);
      
      if (!setting) {
        return res.status(404).json({ error: "Paramètre non trouvé" });
      }
      
      const updatedSetting = await storage.updateSystemSetting(
        req.params.key,
        value,
        req.user!.name
      );
      
      res.json(updatedSetting);
    } catch (error) {
      res.status(500).json({ error: "Impossible de mettre à jour le paramètre" });
    }
  });

  // Routes de gestion des utilisateurs (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      console.log('🔍 API /api/admin/users appelée par:', req.user?.username);
      const users = await storage.getUsers();
      console.log(`📊 ${users.length} utilisateurs trouvés`);
      res.json(users);
    } catch (error) {
      console.log('❌ Erreur API /api/admin/users:', error);
      res.status(500).json({ error: "Impossible de récupérer les utilisateurs" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, role, inPacte } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        name,
        role,
        inPacte
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Impossible de mettre à jour l'utilisateur" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Vérifier qu'on ne supprime pas le dernier admin
      const user = await storage.getUserById(userId);
      if (user?.role === 'ADMIN') {
        const allUsers = await storage.getUsers();
        const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
        if (adminCount <= 1) {
          return res.status(400).json({ error: "Impossible de supprimer le dernier administrateur" });
        }
      }

      await storage.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Impossible de supprimer l'utilisateur" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
