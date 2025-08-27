import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { storage } from '../storage';
import type { User, PacteHistory } from '@shared/schema-pg';

const router = Router();

// 📋 Obtenir tous les enseignants avec leur statut PACTE
router.get('/teachers', requireAuth, requireRole(['SECRETARY', 'PRINCIPAL', 'ADMIN']), async (req, res) => {
  try {
    console.log(`🔍 API /api/pacte/teachers appelée par: ${req.user?.username}`);
    
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

// 📝 Obtenir l'historique PACTE d'un enseignant
router.get('/teachers/:id/history', requireAuth, requireRole(['SECRETARY', 'PRINCIPAL', 'ADMIN']), async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    console.log(`🔍 API /api/pacte/teachers/${teacherId}/history appelée par: ${req.user?.username}`);
    
    // Pour l'instant, on simule l'historique car la table n'existe pas encore en base
    const teacher = await storage.getUser(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    
    // Historique simulé - sera remplacé par une vraie requête DB
    const history: PacteHistory[] = [
      {
        id: 1,
        teacherId: teacher.id,
        teacherName: teacher.name,
        previousStatus: false,
        newStatus: true,
        reason: 'Début d\'année scolaire 2024-2025',
        schoolYear: '2024-2025',
        changedBy: req.user!.id,
        changedByName: req.user!.name,
        createdAt: new Date('2024-09-01'),
      }
    ];
    
    res.json(history);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique PACTE:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✏️ Modifier le statut PACTE d'un enseignant
router.patch('/teachers/:id/status', requireAuth, requireRole(['SECRETARY', 'PRINCIPAL', 'ADMIN']), async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const { inPacte, reason, schoolYear } = req.body;
    
    console.log(`🔄 Modification statut PACTE enseignant ${teacherId} par: ${req.user?.username}`);
    
    // Vérifier que l'enseignant existe
    const teacher = await storage.getUser(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    
    if (teacher.role !== 'TEACHER') {
      return res.status(400).json({ error: 'Seuls les enseignants peuvent avoir un statut PACTE' });
    }
    
    // Sauvegarder l'ancien statut pour l'historique
    const previousStatus = teacher.inPacte;
    
    // Mettre à jour le statut PACTE
    const updatedTeacher = await storage.updateUser(teacherId, {
      inPacte: inPacte,
      updatedAt: new Date(),
    });
    
    // TODO: Ajouter l'entrée dans l'historique PACTE quand la table sera créée
    console.log(`📝 Historique PACTE à ajouter: ${teacher.name} ${previousStatus} → ${inPacte}`);
    
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

// 📊 Obtenir les statistiques PACTE globales
router.get('/statistics', requireAuth, requireRole(['SECRETARY', 'PRINCIPAL', 'ADMIN']), async (req, res) => {
  try {
    console.log(`📊 API /api/pacte/statistics appelée par: ${req.user?.username}`);
    
    const teachers = await storage.getUsers({ role: 'TEACHER' });
    const sessions = await storage.getSessions();
    
    const stats = {
      totalTeachers: teachers.length,
      teachersWithPacte: teachers.filter(t => t.inPacte).length,
      teachersWithoutPacte: teachers.filter(t => !t.inPacte).length,
      pactePercentage: teachers.length > 0 ? 
        Math.round((teachers.filter(t => t.inPacte).length / teachers.length) * 100) : 0,
      
      // Sessions par statut PACTE
      sessionsWithPacte: sessions.filter(s => s.inPacte).length,
      sessionsWithoutPacte: sessions.filter(s => !s.inPacte).length,
      
      // Sessions par type pour enseignants PACTE
      pacteRcd: sessions.filter(s => s.inPacte && s.type === 'RCD').length,
      pacteDevoirs: sessions.filter(s => s.inPacte && s.type === 'DEVOIRS_FAITS').length,
      pacteHse: sessions.filter(s => s.inPacte && s.type === 'HSE').length,
      
      // Sessions par type pour enseignants non-PACTE
      nonPacteRcd: sessions.filter(s => !s.inPacte && s.type === 'RCD').length,
      nonPacteDevoirs: sessions.filter(s => !s.inPacte && s.type === 'DEVOIRS_FAITS').length,
      nonPacteHse: sessions.filter(s => !s.inPacte && s.type === 'HSE').length,
    };
    
    console.log(`📊 Statistiques PACTE calculées: ${stats.teachersWithPacte}/${stats.totalTeachers} enseignants PACTE`);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques PACTE:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 📋 Obtenir la liste des années scolaires disponibles
router.get('/school-years', requireAuth, requireRole(['SECRETARY', 'PRINCIPAL', 'ADMIN']), async (req, res) => {
  try {
    const sessions = await storage.getSessions();
    const years = [...new Set(sessions.map(s => {
      const year = new Date(s.date).getFullYear();
      return `${year}-${year + 1}`;
    }))].sort().reverse();
    
    res.json(years);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des années scolaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
