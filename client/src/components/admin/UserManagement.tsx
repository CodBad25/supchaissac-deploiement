import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, Filter, Users, UserCheck, UserX, Trash2, CheckSquare, Square, Grid3X3, List } from "lucide-react";

// Type définissant un utilisateur (adapté à l'API)
type User = {
  id: number;
  username: string;
  name: string;
  role: 'TEACHER' | 'SECRETARY' | 'PRINCIPAL' | 'ADMIN';
  gender?: 'M' | 'F' | 'OTHER'; // Genre pour les couleurs des cartes
  initials: string;
  inPacte: boolean;
};

export function UserManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const queryClient = useQueryClient();

  // 🔍 États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pacteFilter, setPacteFilter] = useState<string>('all');

  // ✅ États pour la sélection multiple
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 🎴 État pour le mode d'affichage (tableau ou cartes)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Récupérer la liste des utilisateurs depuis l'API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      console.log('🔍 Frontend: Appel API /api/admin/users...');
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Frontend: Erreur API', response.status, response.statusText);
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Frontend: Utilisateurs reçus:', data.length);
      return data;
    },
  });

  // 🔍 Filtrage et recherche intelligente
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Recherche intelligente
    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
        const name = user.name.toLowerCase();
        const username = user.username.toLowerCase();
        const initials = user.initials?.toLowerCase() || '';

        // Recherche par nom complet, prénom, nom, initiales, ou username
        return name.includes(search) ||
               username.includes(search) ||
               initials.includes(search) ||
               // Recherche par mots séparés (ex: "marie petit" trouve "Marie PETIT")
               search.split(' ').every(term => name.includes(term));
      });
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtre par statut Pacte
    if (pacteFilter !== 'all') {
      if (pacteFilter === 'pacte') {
        filtered = filtered.filter(user => user.role === 'TEACHER' && user.inPacte);
      } else if (pacteFilter === 'hors-pacte') {
        filtered = filtered.filter(user => user.role === 'TEACHER' && !user.inPacte);
      }
    }

    return filtered;
  }, [users, searchTerm, roleFilter, pacteFilter]);

  // ✅ Gestion de la sélection multiple
  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setIsAllSelected(newSelected.size === filteredUsers.length && filteredUsers.length > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredUsers.map(user => user.id));
      setSelectedUsers(allIds);
      setIsAllSelected(true);
    } else {
      setSelectedUsers(new Set());
      setIsAllSelected(false);
    }
  };

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Utilisateur mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      setIsDialogOpen(false);
      setCurrentUser(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  // 🗑️ Actions groupées
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedUsers.size} utilisateur${selectedUsers.size > 1 ? 's' : ''} ?`
    );

    if (confirmed) {
      try {
        // Supprimer tous les utilisateurs sélectionnés
        await Promise.all(
          Array.from(selectedUsers).map(id =>
            fetch(`/api/admin/users/${id}`, {
              method: 'DELETE',
              credentials: 'include'
            })
          )
        );

        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        setSelectedUsers(new Set());
        setIsAllSelected(false);

        toast({
          title: "Utilisateurs supprimés",
          description: `${selectedUsers.size} utilisateur${selectedUsers.size > 1 ? 's ont été supprimés' : ' a été supprimé'}.`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression groupée.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkPacteToggle = async (inPacte: boolean) => {
    if (selectedUsers.size === 0) return;

    const teacherIds = Array.from(selectedUsers).filter(id => {
      const user = users.find(u => u.id === id);
      return user?.role === 'TEACHER';
    });

    if (teacherIds.length === 0) {
      toast({
        title: "Aucun enseignant sélectionné",
        description: "Seuls les enseignants peuvent être modifiés pour le Pacte.",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(
        teacherIds.map(id =>
          fetch(`/api/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ inPacte }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
        )
      );

      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSelectedUsers(new Set());
      setIsAllSelected(false);

      toast({
        title: "Statut Pacte modifié",
        description: `${teacherIds.length} enseignant${teacherIds.length > 1 ? 's' : ''} ${inPacte ? 'ajouté(s) au' : 'retiré(s) du'} Pacte.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du statut Pacte.",
        variant: "destructive",
      });
    }
  };

  // 🎯 Mutation pour toggle Pacte individuel
  const togglePacteMutation = useMutation({
    mutationFn: async ({ userId, newPacteStatus }: { userId: number; newPacteStatus: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ inPacte: newPacteStatus }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const user = users.find(u => u.id === variables.userId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      toast({
        title: "Statut Pacte modifié",
        description: `${user?.name} ${variables.newPacteStatus ? 'ajouté(e) au' : 'retiré(e) du'} Pacte.`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut Pacte.",
        variant: "destructive",
      });
    },
  });

  // 🎯 Handler pour toggle Pacte
  const handleTogglePacte = (userId: number, newPacteStatus: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== 'TEACHER') return;

    togglePacteMutation.mutate({ userId, newPacteStatus });
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditUserModal = (user: User) => {
    setCurrentUser({...user});
    setIsNewUser(false);
    setIsDialogOpen(true);
  };

  // Fonction pour ouvrir le modal de création
  const openNewUserModal = () => {
    setCurrentUser({
      id: 0, // Sera remplacé lors de la création
      username: "",
      name: "",
      role: "TEACHER",
      initials: "",
      inPacte: false
    });
    setIsNewUser(true);
    setIsDialogOpen(true);
  };
  
  // Fonction pour mettre à jour un utilisateur
  const updateUser = () => {
    if (!currentUser) return;

    if (isNewUser) {
      // TODO: Implémenter la création d'utilisateur via API
      toast({
        title: "Fonctionnalité à venir",
        description: "La création d'utilisateur sera disponible prochainement. Utilisez l'import CSV pour le moment.",
        variant: "default"
      });
    } else {
      // Mise à jour d'un utilisateur existant via API
      updateUserMutation.mutate({
        id: currentUser.id,
        data: {
          name: currentUser.name,
          role: currentUser.role,
          inPacte: currentUser.inPacte
        }
      });
    }
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUserMutation.mutate(id);
    }
  };
  
  // 🎨 Fonction pour obtenir les couleurs d'avatar selon le genre
  const getGenderColors = (gender: string) => {
    switch (gender) {
      case 'M':
        return 'from-blue-500 to-blue-600'; // Bleu pour les hommes
      case 'F':
        return 'from-pink-500 to-pink-600'; // Rose pour les femmes
      default:
        return 'from-purple-500 to-purple-600'; // Violet par défaut
    }
  };

  // 🎨 Fonction pour obtenir les couleurs modernes de carte selon le genre
  const getGenderCardColors = (gender: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-blue-50 border-blue-300 ring-2 ring-blue-500';
    }

    switch (gender) {
      case 'M':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 hover:shadow-blue-100';
      case 'F':
        return 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:border-pink-300 hover:shadow-pink-100';
      default:
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 hover:shadow-purple-100';
    }
  };

  // Fonction pour afficher le badge de rôle avec la bonne couleur
  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      "TEACHER": "bg-green-100 text-green-800 border-green-200",
      "SECRETARY": "bg-blue-100 text-blue-800 border-blue-200",
      "PRINCIPAL": "bg-purple-100 text-purple-800 border-purple-200",
      "ADMIN": "bg-red-100 text-red-800 border-red-200"
    };
    
    const roleNames: Record<string, string> = {
      "TEACHER": "Enseignant",
      "SECRETARY": "Secrétariat",
      "PRINCIPAL": "Direction",
      "ADMIN": "Admin"
    };
    
    return (
      <Badge variant="outline" className={roleStyles[role]}>
        {roleNames[role]}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* 📊 Statistiques rapides compactes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-400 rounded-full p-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Total</p>
                <p className="text-xl font-bold">{filteredUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-green-400 rounded-full p-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                </svg>
              </div>
              <div>
                <p className="text-green-100 text-xs">Enseignants</p>
                <p className="text-xl font-bold">{filteredUsers.filter(u => u.role === 'TEACHER').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-400 rounded-full p-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-orange-100 text-xs">Pacte</p>
                <p className="text-xl font-bold">{filteredUsers.filter(u => u.role === 'TEACHER' && u.inPacte).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-400 rounded-full p-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-purple-100 text-xs">Admin</p>
                <p className="text-xl font-bold">{filteredUsers.filter(u => ['ADMIN', 'PRINCIPAL', 'SECRETARY'].includes(u.role)).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Barre de recherche et filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, prénom, initiales ou identifiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="flex gap-2">
            {/* 🎴 Toggle Vue Tableau/Cartes */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Cartes
              </button>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="TEACHER">Enseignants</SelectItem>
                <SelectItem value="SECRETARY">Secrétaires</SelectItem>
                <SelectItem value="PRINCIPAL">Principaux</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pacteFilter} onValueChange={setPacteFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Statut Pacte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pacte">En Pacte</SelectItem>
                <SelectItem value="hors-pacte">Hors Pacte</SelectItem>
              </SelectContent>
            </Select>

            {/* 👤 Bouton Nouvel utilisateur */}
            <Button onClick={openNewUserModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Users className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {/* Actions groupées */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedUsers.size} utilisateur{selectedUsers.size > 1 ? 's' : ''} sélectionné{selectedUsers.size > 1 ? 's' : ''} :
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPacteToggle(true)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Ajouter au Pacte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPacteToggle(false)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <UserX className="h-4 w-4 mr-1" />
                Retirer du Pacte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </div>


      {/* 🎴 Vue conditionnelle : Tableau ou Cartes */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow className="h-8">
                <TableHead className="w-12 py-1">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Sélectionner tous les utilisateurs"
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-900 py-1">Utilisateur</TableHead>
                <TableHead className="font-semibold text-gray-900 py-1">Login</TableHead>
                <TableHead className="font-semibold text-gray-900 py-1 hidden md:table-cell">Email</TableHead>
                <TableHead className="font-semibold text-gray-900 py-1">Rôle</TableHead>
                <TableHead className="font-semibold text-gray-900 py-1 hidden sm:table-cell">Statut</TableHead>
                <TableHead className="font-semibold text-gray-900 py-1 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Chargement des utilisateurs...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {searchTerm || roleFilter !== 'all' || pacteFilter !== 'all'
                    ? 'Aucun utilisateur ne correspond aux critères de recherche'
                    : 'Aucun utilisateur trouvé'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={`hover:bg-blue-50 transition-colors h-10 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${selectedUsers.has(user.id) ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                >
                  <TableCell className="py-1">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      aria-label={`Sélectionner ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r ${getGenderColors(user.gender || 'OTHER')} text-white text-xs font-semibold`}>
                          {user.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <span className="font-mono text-sm font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {user.username.includes('@') ? user.username.split('@')[0].toUpperCase() : user.username.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 hidden md:table-cell">
                    <span className="font-mono text-xs text-gray-600">
                      {user.username.includes('@')
                        ? user.username
                        : `${user.username.toLowerCase()}@ac-nantes.fr`
                      }
                    </span>
                  </TableCell>
                  <TableCell className="py-1">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="py-1 hidden sm:table-cell">
                    {user.role === "TEACHER" ? (
                      <button
                        onClick={() => handleTogglePacte(user.id, !user.inPacte)}
                        disabled={togglePacteMutation.isPending}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm ${
                          togglePacteMutation.isPending
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : user.inPacte
                              ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}
                        title={togglePacteMutation.isPending ? "Modification en cours..." : user.inPacte ? "Cliquer pour retirer du Pacte" : "Cliquer pour ajouter au Pacte"}
                      >
                        {togglePacteMutation.isPending ? '⏳' : user.inPacte ? '🎯 Pacte' : '📚 Hors Pacte'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                <TableCell className="text-right py-1">
                  <div className="flex justify-end items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditUserModal(user)} className="hover:bg-blue-50 hover:text-blue-600 h-7 w-7 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600 h-7 w-7 p-0" onClick={() => deleteUser(user.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* 🎴 Vue en cartes - Juste milieu : moderne + dense */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
          {isLoading ? (
            // Skeleton cards pendant le chargement
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">🔍</div>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== 'all' || pacteFilter !== 'all'
                  ? 'Aucun utilisateur ne correspond aux critères de recherche'
                  : 'Aucun utilisateur trouvé'
                }
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-lg border-2 p-2 hover:shadow-md transition-all duration-200 ${getGenderCardColors(user.gender || 'OTHER', selectedUsers.has(user.id))}`}
              >
                {/* Header compact */}
                <div className="flex items-center justify-between mb-2">
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    className="h-3 w-3"
                  />

                  {/* Actions compactes */}
                  <div className="flex space-x-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditUserModal(user)}
                      className="hover:bg-white/50 hover:text-blue-600 h-5 w-5 p-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-white/50 hover:text-red-600 h-5 w-5 p-0"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>

                {/* Avatar et nom - Layout horizontal compact */}
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${getGenderColors(user.gender || 'OTHER')} text-white text-xs font-semibold`}>
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </div>

                {/* Login compact */}
                <div className="text-center mb-1.5">
                  <span className="font-mono text-xs font-medium bg-white/70 text-gray-700 px-1.5 py-0.5 rounded">
                    {user.username.includes('@') ? user.username.split('@')[0].toUpperCase() : user.username.toUpperCase()}
                  </span>
                </div>

                {/* Email compact */}
                <div className="text-center mb-1.5">
                  <p className="text-xs text-gray-500 truncate">
                    {user.username.includes('@')
                      ? user.username
                      : `${user.username.toLowerCase()}@ac-nantes.fr`
                    }
                  </p>
                </div>

                {/* Rôle et Statut Pacte - Layout horizontal */}
                <div className="space-y-1">
                  <div className="text-center">
                    {getRoleBadge(user.role)}
                  </div>

                  {user.role === "TEACHER" && (
                    <button
                      onClick={() => handleTogglePacte(user.id, !user.inPacte)}
                      disabled={togglePacteMutation.isPending}
                      className={`w-full inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        togglePacteMutation.isPending
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : user.inPacte
                            ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700'
                      }`}
                      title={togglePacteMutation.isPending ? "Modification en cours..." : user.inPacte ? "Retirer du Pacte" : "Ajouter au Pacte"}
                    >
                      {togglePacteMutation.isPending ? '⏳' : user.inPacte ? '🎯 Pacte' : '📚 Hors Pacte'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Modal d'édition/création d'utilisateur */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewUser ? "Créer un utilisateur" : "Modifier un utilisateur"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={currentUser?.name || ""}
                onChange={(e) => setCurrentUser(currentUser ? {...currentUser, name: e.target.value} : null)}
                placeholder="Prénom NOM"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Email / Identifiant</Label>
              <Input
                id="username"
                value={currentUser?.username || ""}
                onChange={(e) => setCurrentUser(currentUser ? {...currentUser, username: e.target.value} : null)}
                placeholder="prenom.nom@college-chaissac.fr"
                disabled={!isNewUser}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="initials">Initiales</Label>
              <Input
                id="initials"
                value={currentUser?.initials || ""}
                onChange={(e) => setCurrentUser(currentUser ? {...currentUser, initials: e.target.value.toUpperCase()} : null)}
                placeholder="PN"
                maxLength={4}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Rôle</Label>
              <Select 
                value={currentUser?.role || "TEACHER"} 
                onValueChange={(value: 'TEACHER' | 'SECRETARY' | 'PRINCIPAL' | 'ADMIN') => 
                  setCurrentUser(currentUser ? {...currentUser, role: value} : null)
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Enseignant</SelectItem>
                  <SelectItem value="SECRETARY">Secrétariat</SelectItem>
                  <SelectItem value="PRINCIPAL">Direction</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {currentUser?.role === "TEACHER" && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentUser?.inPacte || false}
                  onCheckedChange={(checked) =>
                    setCurrentUser(currentUser ? {...currentUser, inPacte: checked} : null)
                  }
                  id="pacte"
                />
                <Label htmlFor="pacte">Pacte Enseignant</Label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fermer</Button>
            <Button onClick={updateUser}>{isNewUser ? "Créer" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}