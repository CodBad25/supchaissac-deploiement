// 🛡️ MODULE DE CONFORMITÉ RGPD
// Gestion des droits des personnes et de la protection des données

import { getStorage } from "./storage-instance";
import { User } from "@shared/schema";

export interface RGPDRequest {
  userId: number;
  requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY';
  requestDate: Date;
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  reason?: string;
}

export class RGPDCompliance {
  
  // 📋 Article 15 RGPD - Droit d'accès
  async exportUserData(userId: number): Promise<any> {
    const storage = getStorage();
    
    try {
      // Récupérer toutes les données de l'utilisateur
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      const sessions = await storage.getSessionsByTeacher(userId);
      const teacherSetup = await storage.getTeacherSetup(userId);

      // Données exportées (format JSON)
      const userData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          initials: user.initials,
          inPacte: user.inPacte,
          // Mot de passe exclu pour sécurité
        },
        sessions: sessions.map(session => ({
          id: session.id,
          date: session.date,
          timeSlot: session.timeSlot,
          type: session.type,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        })),
        teacherSetup: teacherSetup ? {
          inPacte: teacherSetup.inPacte,
          signature: teacherSetup.signature ? "Signature présente" : "Aucune signature",
        } : null,
        legalBasis: "Intérêt légitime - Gestion administrative des heures supplémentaires",
        retentionPeriod: "5 ans après fin de relation contractuelle",
        dataController: {
          name: process.env.SCHOOL_NAME || "Établissement scolaire",
          address: process.env.SCHOOL_ADDRESS || "Adresse non configurée",
          email: process.env.SCHOOL_EMAIL || "contact@etablissement.fr",
          dpo: {
            name: process.env.DPO_NAME || "DPO non désigné",
            email: process.env.DPO_EMAIL || "dpo@etablissement.fr"
          }
        }
      };

      // Log de l'export pour audit
      console.log(`📊 Export RGPD effectué pour l'utilisateur ${user.username} (ID: ${userId})`);
      
      return userData;
    } catch (error) {
      console.error("❌ Erreur export RGPD:", error);
      throw error;
    }
  }

  // 🗑️ Article 17 RGPD - Droit à l'effacement
  async deleteUserData(userId: number, reason: string): Promise<boolean> {
    const storage = getStorage();
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier si l'effacement est possible (obligations légales)
      const canDelete = await this.canDeleteUserData(userId);
      if (!canDelete.allowed) {
        throw new Error(`Effacement impossible: ${canDelete.reason}`);
      }

      // Supprimer les données dans l'ordre
      // 1. Sessions de l'utilisateur
      const sessions = await storage.getSessionsByTeacher(userId);
      for (const session of sessions) {
        await storage.deleteSession(session.id);
      }

      // 2. Configuration enseignant
      const teacherSetup = await storage.getTeacherSetup(userId);
      if (teacherSetup) {
        await storage.deleteTeacherSetup(userId);
      }

      // 3. Utilisateur lui-même
      await storage.deleteUser(userId);

      // Log de la suppression pour audit
      console.log(`🗑️ Suppression RGPD effectuée pour l'utilisateur ${user.username} (ID: ${userId}). Raison: ${reason}`);
      
      return true;
    } catch (error) {
      console.error("❌ Erreur suppression RGPD:", error);
      throw error;
    }
  }

  // 🔍 Vérifier si les données peuvent être supprimées
  private async canDeleteUserData(userId: number): Promise<{allowed: boolean, reason?: string}> {
    const storage = getStorage();
    
    try {
      // Vérifier s'il y a des sessions en cours de traitement
      const sessions = await storage.getSessionsByTeacher(userId);
      const pendingSessions = sessions.filter(s => 
        s.status === 'PENDING_REVIEW' || 
        s.status === 'PENDING_VALIDATION' || 
        s.status === 'VALIDATED'
      );

      if (pendingSessions.length > 0) {
        return {
          allowed: false,
          reason: `${pendingSessions.length} session(s) en cours de traitement. Finaliser d'abord le processus.`
        };
      }

      // Vérifier la période de rétention légale
      const retentionYears = parseInt(process.env.DATA_RETENTION_YEARS || "5");
      const oldestSession = sessions.reduce((oldest, session) => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate < oldest ? sessionDate : oldest;
      }, new Date());

      const retentionEndDate = new Date(oldestSession);
      retentionEndDate.setFullYear(retentionEndDate.getFullYear() + retentionYears);

      if (new Date() < retentionEndDate) {
        return {
          allowed: false,
          reason: `Période de rétention légale non écoulée (jusqu'au ${retentionEndDate.toLocaleDateString('fr-FR')})`
        };
      }

      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        reason: `Erreur lors de la vérification: ${error.message}`
      };
    }
  }

  // 📝 Article 16 RGPD - Droit de rectification
  async updateUserData(userId: number, updates: Partial<User>): Promise<boolean> {
    const storage = getStorage();
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Filtrer les champs autorisés à la modification
      const allowedFields = ['name', 'username', 'initials'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error("Aucun champ modifiable fourni");
      }

      await storage.updateUser(userId, filteredUpdates);

      // Log de la modification pour audit
      console.log(`✏️ Rectification RGPD effectuée pour l'utilisateur ${user.username} (ID: ${userId}). Champs: ${Object.keys(filteredUpdates).join(', ')}`);
      
      return true;
    } catch (error) {
      console.error("❌ Erreur rectification RGPD:", error);
      throw error;
    }
  }

  // 📊 Générer un rapport de conformité
  async generateComplianceReport(): Promise<any> {
    const storage = getStorage();
    
    try {
      const users = await storage.getUsers();
      const allSessions = await storage.getSessions();

      const report = {
        generatedAt: new Date().toISOString(),
        dataController: {
          name: process.env.SCHOOL_NAME || "Établissement scolaire",
          dpo: process.env.DPO_NAME || "DPO non désigné"
        },
        statistics: {
          totalUsers: users.length,
          totalSessions: allSessions.length,
          usersByRole: users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          sessionsByStatus: allSessions.reduce((acc, session) => {
            acc[session.status] = (acc[session.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        dataRetention: {
          policy: `${process.env.DATA_RETENTION_YEARS || 5} ans`,
          oldestData: allSessions.length > 0 ? 
            Math.min(...allSessions.map(s => new Date(s.createdAt).getTime())) : null
        },
        securityMeasures: {
          passwordHashing: "bcrypt (12 rounds)",
          sessionSecurity: "Secure cookies, HTTPS only",
          accessControl: "Role-based permissions",
          auditLogging: "Enabled"
        }
      };

      return report;
    } catch (error) {
      console.error("❌ Erreur génération rapport RGPD:", error);
      throw error;
    }
  }
}

export const rgpdCompliance = new RGPDCompliance();
