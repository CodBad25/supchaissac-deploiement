import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { getStorage } from './storage-instance';
import { userSwitcherList, users } from '../shared/schema';

const router = Router();

// 🔧 DEV TOOL - User Switcher List Management
// This entire module will be removed in production

// Utilisateurs de démonstration par défaut (les 4 principaux)
const DEFAULT_DEMO_USERS = [
  {
    userId: 1,
    userName: "Sophie Martin",
    userRole: "TEACHER" as const,
    userCredentials: JSON.stringify({
      username: "teacher1@example.com",
      password: "password123"
    }),
    description: "Enseignante sans pacte",
    isDemoUser: true
  },
  {
    userId: 2,
    userName: "Laure Martin", 
    userRole: "SECRETARY" as const,
    userCredentials: JSON.stringify({
      username: "secretary@example.com",
      password: "password123"
    }),
    description: "Secrétariat",
    isDemoUser: true
  },
  {
    userId: 3,
    userName: "Jean Dupont",
    userRole: "PRINCIPAL" as const,
    userCredentials: JSON.stringify({
      username: "principal@example.com",
      password: "password123"
    }),
    description: "Direction",
    isDemoUser: true
  },
  {
    userId: 4,
    userName: "Admin",
    userRole: "ADMIN" as const,
    userCredentials: JSON.stringify({
      username: "admin@example.com",
      password: "password123"
    }),
    description: "Administrateur système",
    isDemoUser: true
  }
];

// GET /api/user-switcher - Récupérer la liste des utilisateurs pour le dropdown
router.get('/', async (req, res) => {
  try {
    const storage = getStorage();
    
    // Récupérer la liste depuis la base de données
    const switcherUsers = await storage.db
      .select()
      .from(userSwitcherList)
      .where(eq(userSwitcherList.isActive, true))
      .orderBy(userSwitcherList.isDemoUser, userSwitcherList.userRole, userSwitcherList.userName);

    // Si la liste est vide, initialiser avec les utilisateurs par défaut
    if (switcherUsers.length === 0) {
      console.log('🔧 Initialisation de la liste user-switcher avec les utilisateurs par défaut');
      
      for (const demoUser of DEFAULT_DEMO_USERS) {
        await storage.db.insert(userSwitcherList).values(demoUser);
      }
      
      // Récupérer la liste mise à jour
      const updatedList = await storage.db
        .select()
        .from(userSwitcherList)
        .where(eq(userSwitcherList.isActive, true))
        .orderBy(userSwitcherList.isDemoUser, userSwitcherList.userRole, userSwitcherList.userName);
      
      return res.json(updatedList);
    }

    res.json(switcherUsers);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la liste user-switcher:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/user-switcher/add-real-user - Ajouter un utilisateur réel à la liste
router.post('/add-real-user', async (req, res) => {
  try {
    const { userId, userName, userRole, username, password } = req.body;
    
    if (!userId || !userName || !userRole || !username || !password) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const storage = getStorage();
    
    // Vérifier si l'utilisateur n'est pas déjà dans la liste
    const existing = await storage.db
      .select()
      .from(userSwitcherList)
      .where(eq(userSwitcherList.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return res.json({ message: 'Utilisateur déjà dans la liste', existing: existing[0] });
    }

    // Ajouter l'utilisateur réel à la liste
    const newSwitcherUser = {
      userId,
      userName,
      userRole,
      userCredentials: JSON.stringify({ username, password }),
      description: `${userRole} (utilisateur réel)`,
      isDemoUser: false,
      isActive: true
    };

    const result = await storage.db.insert(userSwitcherList).values(newSwitcherUser).returning();
    
    console.log(`✅ Utilisateur réel ajouté à la liste switcher: ${userName} (${userRole})`);
    res.json({ message: 'Utilisateur ajouté avec succès', user: result[0] });
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'utilisateur réel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/user-switcher/reset - Reset la liste (admin uniquement)
router.delete('/reset', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }

    const storage = getStorage();
    
    // Supprimer tous les utilisateurs non-demo
    await storage.db
      .delete(userSwitcherList)
      .where(eq(userSwitcherList.isDemoUser, false));
    
    console.log('🔄 Liste user-switcher reset - utilisateurs réels supprimés');
    res.json({ message: 'Liste reset avec succès - seuls les 4 utilisateurs de base restent' });
  } catch (error) {
    console.error('❌ Erreur lors du reset de la liste:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
