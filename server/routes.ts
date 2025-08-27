import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { initializeStorage, getStorage } from "./storage-instance";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSessionSchema, insertTeacherSetupSchema, insertSystemSettingSchema } from "@shared/schema";
import multer from "multer";
import bcrypt from "bcrypt";
import Papa from "papaparse";
import iconv from "iconv-lite";
import fs from "fs";

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

  // API routes
  // Sessions
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log(`📊 [API] GET /api/sessions - User: ${req.user!.name} (${userRole})`);

    try {
      let sessions;

      // Filter sessions based on user role
      if (userRole === "TEACHER") {
        console.log(`🎓 [API] Récupération des sessions pour l'enseignant ID: ${userId}`);
        sessions = await storage.getSessionsByTeacher(userId);
      } else {
        console.log(`👥 [API] Récupération de toutes les sessions (rôle: ${userRole})`);
        sessions = await storage.getSessions();
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [API] Sessions récupérées: ${sessions.length} sessions (${duration}ms)`);

      res.json(sessions);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`🚨 [API] Erreur récupération sessions pour ${req.user!.name} (${duration}ms):`, error);
      res.status(500).json({
        error: "Failed to fetch sessions",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
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
      console.log('📝 Données reçues:', req.body);

      // Validate input
      const validatedData = insertSessionSchema.parse(req.body);
      console.log('✅ Données validées:', validatedData);

      // Teachers can only create sessions for themselves
      if (req.user!.role === "TEACHER" && validatedData.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Cannot create sessions for other teachers" });
      }

      // Récupérer le vrai nom de l'enseignant
      const teacher = await storage.getUserById(validatedData.teacherId);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Ajouter originalType automatiquement (même valeur que type à la création)
      const sessionDataWithOriginalType = {
        ...validatedData,
        teacherName: teacher.name, // Utiliser le vrai nom au lieu de l'email
        originalType: validatedData.type,
        status: "PENDING_REVIEW" // Statut par défaut
      };

      console.log('🔧 Données finales pour insertion:', sessionDataWithOriginalType);

      const session = await storage.createSession(sessionDataWithOriginalType);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
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
        // Teachers can only update their own sessions that are in PENDING_REVIEW or PENDING_DOCUMENTS status
        if (session.teacherId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }

        if (session.status !== "PENDING_REVIEW" && session.status !== "PENDING_DOCUMENTS") {
          return res.status(403).json({ error: "Cannot update sessions that are already in review" });
        }
      } else if (req.user!.role === "SECRETARY") {
        // Secretary can change status according to workflow
        if (req.body.status && req.body.status !== session.status) {
          const allowedTransitions = {
            "PENDING_REVIEW": ["PENDING_VALIDATION", "PENDING_DOCUMENTS", "REJECTED"],
            "PENDING_DOCUMENTS": ["PENDING_VALIDATION", "REJECTED"],
            "VALIDATED": ["PAID"] // Si fonctionnalité paiement activée
          };

          const currentStatus = session.status as keyof typeof allowedTransitions;
          const newStatus = req.body.status;

          if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
            return res.status(403).json({
              error: `Transition non autorisée: ${currentStatus} → ${newStatus}`
            });
          }
        }
      } else if (req.user!.role === "PRINCIPAL") {
        // Principal has all secretary permissions + validation powers
        if (req.body.status && req.body.status !== session.status) {
          const allowedTransitions = {
            "PENDING_REVIEW": ["PENDING_VALIDATION", "PENDING_DOCUMENTS", "VALIDATED", "REJECTED"],
            "PENDING_DOCUMENTS": ["PENDING_VALIDATION", "VALIDATED", "REJECTED"],
            "PENDING_VALIDATION": ["VALIDATED", "REJECTED"]
          };

          const currentStatus = session.status as keyof typeof allowedTransitions;
          const newStatus = req.body.status;

          if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
            return res.status(403).json({
              error: `Transition non autorisée: ${currentStatus} → ${newStatus}`
            });
          }
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
      
      // Créer une notification si le statut change
      if (req.body.status && req.body.status !== session.status) {
        await createStatusNotification(session, req.body.status, req.body.comment);
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

  // Configuration multer pour l'upload de fichiers CSV (admin)
  const uploadCSV = multer({
    dest: 'tmp/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Seuls les fichiers CSV sont acceptés'));
      }
    }
  });

  // Configuration multer pour l'upload de documents joints aux sessions
  const uploadAttachment = multer({
    dest: 'uploads/attachments/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, Excel, CSV, Images'));
      }
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

  // Import des utilisateurs depuis CSV (admin only)
  app.post("/api/admin/import-users", isAdmin, uploadCSV.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier CSV fourni" });
      }

      // 🎯 DÉCODEUR PRONOTE PRÉCIS - STRUCTURE RÉELLE IDENTIFIÉE
      console.log('🔧 Lecture du fichier Pronote avec structure connue...');

      let fileBuffer = fs.readFileSync(req.file.path);
      let csvContent = iconv.decode(fileBuffer, 'utf8');

      console.log('📊 Fichier brut, taille:', csvContent.length, 'caractères');

      // DÉCODAGE PRONOTE AVEC STRUCTURE EXACTE
      if (csvContent.includes('+ADs-')) {
        console.log('🔍 Format Pronote encodé détecté - Décodage avec structure réelle...');

        // Décoder UTF-7
        let decoded = csvContent
          .replace(/\+ADs-/g, ';')
          .replace(/\+AEA-/g, '@')
          .replace(/\+AC0-/g, '-')
          .replace(/\+ACY-/g, '&')
          .replace(/\+ACI-/g, '"')
          .replace(/\+ACA-/g, ' ')
          .replace(/\+/g, '');

        console.log('🔍 Après décodage:', decoded.substring(0, 200));

        // 🎯 DÉCODEUR PRONOTE INTELLIGENT - ANALYSE DYNAMIQUE
        console.log('🔍 Analyse intelligente du fichier Pronote...');

        // Supprimer les retours à la ligne et créer une seule ligne
        const singleLine = decoded.replace(/\n/g, '').replace(/\r/g, '');
        const allFields = singleLine.split(';');

        console.log(`📊 Total champs: ${allFields.length}`);
        console.log(`🔍 Premiers champs:`, allFields.slice(0, 15));

        // Détecter la structure en cherchant les patterns d'en-têtes
        let headerIndex = -1;
        for (let i = 0; i < Math.min(50, allFields.length); i++) {
          const field = allFields[i].trim().toUpperCase();
          if (field === 'LOGIN' || field === 'NOM' || field === 'PRENOM') {
            headerIndex = i;
            break;
          }
        }

        console.log(`🎯 En-têtes détectés à l'index: ${headerIndex}`);

        // Si pas d'en-têtes trouvés, commencer au début
        if (headerIndex === -1) headerIndex = 0;

        // Extraire les enseignants en analysant la structure
        const teachers = [];
        const startIndex = headerIndex === 0 ? 0 : headerIndex;

        // Analyser par groupes de champs pour trouver la structure
        for (let i = startIndex; i < allFields.length - 12; i += 13) {
          const login = allFields[i] || '';
          const civilite = allFields[i + 1] || '';
          const nom = allFields[i + 2] || '';
          const prenom = allFields[i + 3] || '';
          const dateNaiss = allFields[i + 4] || '';
          const lieuNaiss = allFields[i + 5] || '';
          const famille = allFields[i + 6] || '';
          const discipline = allFields[i + 7] || '';
          const email = allFields[i + 8] || '';

          // Nettoyer les champs
          const cleanLogin = login.trim();
          const cleanNom = nom.trim();
          const cleanPrenom = prenom.trim();
          const cleanEmail = email.trim();
          const cleanDiscipline = discipline.trim();

          // Validation stricte pour identifier les vrais enseignants
          const isValidName = (name) => {
            return name &&
                   name.length > 1 &&
                   name.length < 50 &&
                   !name.includes('@') &&
                   !name.match(/^\d/) &&
                   !name.match(/^[A-Z]{1,4}$/) &&
                   !name.includes('L1') &&
                   name !== 'NOM' &&
                   name !== 'PRENOM' &&
                   name !== 'LOGIN';
          };

          const isValidEmail = (email) => {
            return email.includes('@') && email.includes('.');
          };

          // Vérifier si c'est un enseignant valide
          if (isValidName(cleanNom) && isValidName(cleanPrenom)) {
            // Générer un login si manquant
            let finalLogin = cleanLogin;
            if (!finalLogin || finalLogin.length < 2) {
              finalLogin = (cleanPrenom.charAt(0) + cleanNom.replace(/\s+/g, '')).toLowerCase();
            }

            // Nettoyer l'email
            let finalEmail = cleanEmail;
            if (!isValidEmail(finalEmail)) {
              finalEmail = `${finalLogin}@ac-nantes.fr`;
            }

            teachers.push({
              LOGIN: finalLogin,
              NOM: cleanNom.toUpperCase(),
              PRENOM: cleanPrenom,
              EMAIL: finalEmail,
              DISCIPLINE: cleanDiscipline
            });

            console.log(`   ✅ ${teachers.length}. ${cleanPrenom} ${cleanNom} (${finalLogin})`);
          }
        }

        // Créer le CSV final propre
        const headers = ['LOGIN', 'NOM', 'PRENOM', 'EMAIL', 'DISCIPLINE'];
        const csvLines = [headers.join(',')];

        for (const teacher of teachers) {
          const line = headers.map(h => `"${teacher[h] || ''}"`).join(',');
          csvLines.push(line);
        }

        csvContent = csvLines.join('\n');
        console.log(`✅ ${teachers.length} enseignants extraits avec la structure Pronote réelle`);

        // Debug: afficher les premiers enseignants
        teachers.slice(0, 3).forEach((teacher, i) => {
          console.log(`   ${i+1}. ${teacher.PRENOM} ${teacher.NOM} (${teacher.LOGIN}) - ${teacher.EMAIL}`);
        });
      }

      // Parser le CSV final
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        transformHeader: (header: string) => header.trim().toUpperCase()
      });

      const users = parseResult.data as any[];
      const headers = parseResult.meta.fields || [];

      console.log('✅ Parsing final réussi!');
      console.log('🔍 En-têtes finaux:', headers);
      console.log('🔍 Utilisateurs à importer:', users.length);

      // DEBUG: Afficher le premier utilisateur parsé
      if (users.length > 0) {
        console.log('🔍 Premier utilisateur parsé:', users[0]);
      }

      let imported = 0;
      let skipped = 0;
      let errors = 0;
      const details: string[] = [];

      // 🎯 MAPPING EXACT PRONOTE (STRUCTURE RÉELLE CONFIRMÉE)
      const columnMapping = {
        login: 'LOGIN',      // Colonne 0
        nom: 'NOM',          // Colonne 2
        prenom: 'PRENOM',    // Colonne 3
        email: 'EMAIL',      // Colonne 8
        discipline: 'DISCIPLINE' // Colonne 7
      };

      console.log('🎯 Mapping Pronote exact:', columnMapping);

      // Ajouter les informations au rapport
      details.push(`📊 ANALYSE DU FICHIER CSV:`);
      details.push(`   Séparateur: ${parseResult.meta.delimiter}`);
      details.push(`   Colonnes trouvées (${headers.length}): ${headers.join(', ')}`);
      details.push(`   Lignes de données: ${users.length}`);
      details.push(`   Mapping détecté:`);
      details.push(`     LOGIN → ${columnMapping.login || 'NON TROUVÉ'}`);
      details.push(`     NOM → ${columnMapping.nom || 'NON TROUVÉ'}`);
      details.push(`     PRENOM → ${columnMapping.prenom || 'NON TROUVÉ'}`);
      details.push(`     EMAIL → ${columnMapping.email || 'NON TROUVÉ'}`);
      details.push(``);

      for (const userData of users) {
        try {
          // 🎯 EXTRACTION INTELLIGENTE avec mapping automatique
          const login = columnMapping.login ? userData[columnMapping.login] : '';
          const nom = columnMapping.nom ? userData[columnMapping.nom] : '';
          const prenom = columnMapping.prenom ? userData[columnMapping.prenom] : '';
          const email = columnMapping.email ? userData[columnMapping.email] : '';
          const discipline = columnMapping.discipline ? userData[columnMapping.discipline] : '';
          const classes = columnMapping.classes ? userData[columnMapping.classes] : '';

          // Nettoyer les données
          const cleanLogin = (login || '').trim();
          const cleanNom = (nom || '').trim().toUpperCase();
          const cleanPrenom = (prenom || '').trim();
          const cleanEmail = (email || '').trim();

          console.log(`🔍 Extraction: LOGIN="${cleanLogin}", NOM="${cleanNom}", PRENOM="${cleanPrenom}"`);

          if (!cleanNom || !cleanPrenom) {
            details.push(`⚠️ Ligne ignorée - Nom ou prénom manquant (LOGIN: ${cleanLogin})`);
            skipped++;
            continue;
          }

          // Utiliser le LOGIN comme username principal, sinon générer depuis email
          const username = cleanLogin || cleanEmail ||
                          `${cleanPrenom.toLowerCase().replace(/[^a-z]/g, '')}.${cleanNom.toLowerCase().replace(/[^a-z]/g, '')}@college-chaissac.fr`;

          // Vérifier si l'utilisateur existe
          const existing = await storage.getUserByUsername(username);
          if (existing) {
            details.push(`⚠️ ${cleanPrenom} ${cleanNom} (${username}) existe déjà`);
            skipped++;
            continue;
          }

          // Créer l'utilisateur
          const name = `${cleanPrenom} ${cleanNom}`;
          const initials = `${cleanPrenom.charAt(0).toUpperCase()}${cleanNom.charAt(0).toUpperCase()}`;
          const hashedPassword = await bcrypt.hash('SupChaissac2025!', 12);
          const inPacte = false; // Par défaut HORS PACTE

          const user = await storage.createUser({
            username,
            name,
            role: 'TEACHER',
            initials,
            inPacte,
            password: hashedPassword
          });

          // Créer la configuration enseignant de base
          try {
            await storage.createTeacherSetup({
              teacherId: user.id,
              inPacte: inPacte,
              signature: null
            });
          } catch (setupError) {
            // Si la création du setup échoue, ce n'est pas grave pour l'import
            console.log('⚠️ Impossible de créer teacher_setup pour', user.name, ':', setupError.message);
          }

          details.push(`✅ ${name} importé`);
          imported++;

        } catch (error: any) {
          details.push(`❌ Erreur: ${error.message}`);
          errors++;
        }
      }

      // Nettoyer le fichier temporaire
      fs.unlinkSync(req.file.path);

      res.json({
        imported,
        skipped,
        errors,
        details
      });

    } catch (error: any) {
      res.status(500).json({ error: `Erreur d'import: ${error.message}` });
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
      const updateData = req.body;

      // Mettre à jour l'utilisateur
      const updatedUser = await storage.updateUser(userId, updateData);

      // Si on modifie le statut PACTE, mettre à jour aussi teacher_setups
      if (updateData.inPacte !== undefined) {
        try {
          const teacherSetup = await storage.getTeacherSetup(userId);
          if (teacherSetup) {
            await storage.updateTeacherSetup(userId, { inPacte: updateData.inPacte });
          } else {
            // Créer le setup s'il n'existe pas
            await storage.createTeacherSetup({
              teacherId: userId,
              inPacte: updateData.inPacte,
              signature: null
            });
          }
        } catch (setupError) {
          console.log('⚠️ Erreur mise à jour teacher_setup:', setupError.message);
        }
      }

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

  // 📎 ROUTES POUR LES DOCUMENTS JOINTS

  // Upload d'un document joint à une session
  app.post("/api/sessions/:sessionId/attachments", isAuthenticated, uploadAttachment.single('file'), async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      // Vérifier que la session existe et appartient à l'utilisateur (ou admin/secrétaire)
      const session = await storage.getSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      if (req.user!.role === "TEACHER" && session.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Vous ne pouvez joindre des documents qu'à vos propres sessions" });
      }

      const attachmentData = {
        sessionId,
        fileName: `${Date.now()}_${file.originalname}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        uploadedBy: req.user!.id,
      };

      const attachment = await storage.createAttachment(attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      res.status(500).json({ error: "Erreur lors de l'upload du document" });
    }
  });

  // Récupérer les documents d'une session
  app.get("/api/sessions/:sessionId/attachments", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const attachments = await storage.getAttachmentsBySession(sessionId);
      res.json(attachments);
    } catch (error) {
      console.error('Error getting attachments:', error);
      res.status(500).json({ error: "Erreur lors de la récupération des documents" });
    }
  });

  // Télécharger un document
  app.get("/api/attachments/:id/download", isAuthenticated, async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.getAttachmentById(attachmentId);

      if (!attachment) {
        return res.status(404).json({ error: "Document non trouvé" });
      }

      // Vérifier les permissions
      const session = await storage.getSessionById(attachment.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session associée non trouvée" });
      }

      if (req.user!.role === "TEACHER" && session.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Accès non autorisé à ce document" });
      }

      res.download(attachment.filePath, attachment.originalName);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
  });

  // Vérifier un document (secrétaire/principal)
  app.patch("/api/attachments/:id/verify", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role === "TEACHER") {
        return res.status(403).json({ error: "Seuls les secrétaires et principaux peuvent vérifier les documents" });
      }

      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.verifyAttachment(attachmentId, req.user!.id);

      if (!attachment) {
        return res.status(404).json({ error: "Document non trouvé" });
      }

      res.json(attachment);
    } catch (error) {
      console.error('Error verifying attachment:', error);
      res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // Archiver un document (secrétaire/principal)
  app.patch("/api/attachments/:id/archive", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role === "TEACHER") {
        return res.status(403).json({ error: "Seuls les secrétaires et principaux peuvent archiver les documents" });
      }

      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.archiveAttachment(attachmentId, req.user!.id);

      if (!attachment) {
        return res.status(404).json({ error: "Document non trouvé" });
      }

      res.json(attachment);
    } catch (error) {
      console.error('Error archiving attachment:', error);
      res.status(500).json({ error: "Erreur lors de l'archivage" });
    }
  });

  // Supprimer un document
  app.delete("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.getAttachmentById(attachmentId);

      if (!attachment) {
        return res.status(404).json({ error: "Document non trouvé" });
      }

      // Vérifier les permissions
      const session = await storage.getSessionById(attachment.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session associée non trouvée" });
      }

      if (req.user!.role === "TEACHER" && session.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres documents" });
      }

      const deleted = await storage.deleteAttachment(attachmentId);
      if (deleted) {
        // Supprimer le fichier physique
        try {
          fs.unlinkSync(attachment.filePath);
        } catch (error) {
          console.warn('Could not delete physical file:', error);
        }
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Erreur lors de la suppression" });
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });

  // 📋 Routes PACTE
  // Obtenir tous les enseignants avec leur statut PACTE
  app.get("/api/pacte/teachers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!['SECRETARY', 'PRINCIPAL', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      console.log(`🔍 API /api/pacte/teachers appelée par: ${user.username}`);

      const teachers = await storage.getUsers({ role: 'TEACHER' });

      // Enrichir avec les statistiques de sessions
      const teachersWithStats = await Promise.all(
        teachers.map(async (teacher) => {
          const sessions = await storage.getSessions({ teacherId: teacher.id });
          const currentYear = new Date().getFullYear();
          const currentYearSessions = sessions.filter(s =>
            new Date(s.date).getFullYear() === currentYear
          );

          return {
            ...teacher,
            stats: {
              totalSessions: sessions.length,
              currentYearSessions: currentYearSessions.length,
              rcdSessions: currentYearSessions.filter(s => s.type === 'RCD').length,
              devoirsFaitsSessions: currentYearSessions.filter(s => s.type === 'DEVOIRS_FAITS').length,
              hseSessions: currentYearSessions.filter(s => s.type === 'HSE').length,
              validatedSessions: currentYearSessions.filter(s => s.status === 'VALIDATED' || s.status === 'PAID').length,
            }
          };
        })
      );

      console.log(`📊 ${teachersWithStats.length} enseignants trouvés avec statistiques`);
      res.json(teachersWithStats);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des enseignants:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Modifier le statut PACTE d'un enseignant
  app.patch("/api/pacte/teachers/:id/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!['SECRETARY', 'PRINCIPAL', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const teacherId = parseInt(req.params.id);
      const { inPacte, reason, schoolYear } = req.body;

      console.log(`🔄 Modification statut PACTE enseignant ${teacherId} par: ${user.username}`);

      // Vérifier que l'enseignant existe
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ error: 'Enseignant non trouvé' });
      }

      if (teacher.role !== 'TEACHER') {
        return res.status(400).json({ error: 'Seuls les enseignants peuvent avoir un statut PACTE' });
      }

      // Mettre à jour le statut PACTE
      const updatedTeacher = await storage.updateUser(teacherId, {
        inPacte: inPacte,
        updatedAt: new Date(),
      });

      console.log(`✅ Statut PACTE mis à jour pour: ${teacher.name}`);
      res.json({
        success: true,
        teacher: updatedTeacher,
        message: `Statut PACTE mis à jour pour ${teacher.name}`
      });
    } catch (error) {
      console.error('❌ Erreur lors de la modification du statut PACTE:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Fonction pour créer des notifications de changement de statut
  async function createStatusNotification(session: any, newStatus: string, comment?: string) {
    try {
      let title = '';
      let message = '';

      switch (newStatus) {
        case 'PENDING_DOCUMENTS':
          title = 'Pièces jointes requises';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) nécessite des pièces jointes supplémentaires.`;
          if (comment) {
            message += `\n\nMessage de la secrétaire : ${comment}`;
          }
          break;

        case 'REJECTED':
          title = 'Déclaration rejetée';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) a été rejetée.`;
          if (comment) {
            message += `\n\nMotif : ${comment}`;
          }
          break;

        case 'PENDING_VALIDATION':
          title = 'Déclaration transmise';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) a été transmise au principal pour validation.`;
          break;

        case 'VALIDATED':
          title = 'Déclaration validée';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) a été validée par le principal.`;
          break;

        case 'READY_FOR_PAYMENT':
          title = 'Prêt pour paiement';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) est prête pour le paiement.`;
          break;

        case 'PAID':
          title = 'Déclaration payée';
          message = `Votre déclaration du ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.type}) a été mise en paiement.`;
          break;
      }

      if (title && message) {
        await storage.db.execute(`
          INSERT INTO notifications (user_id, session_id, type, title, message)
          VALUES ($1, $2, $3, $4, $5)
        `, [session.teacherId, session.id, newStatus, title, message]);

        console.log(`📬 Notification créée pour l'utilisateur ${session.teacherId}: ${title}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
