import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Teacher {
  id: number;
  name: string;
  username: string;
  initials: string;
  inPacte: boolean;
  role: string;
}

interface PacteChange {
  teacherId: number;
  teacherName: string;
  oldStatus: boolean;
  newStatus: boolean;
  reason: string;
  changedAt: string;
  changedBy: string;
}

export function TeacherPacteManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPacte, setFilterPacte] = useState<'all' | 'pacte' | 'non-pacte'>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la liste des enseignants
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiRequest('/api/admin/users'),
  });

  // Filtrer seulement les enseignants
  const teachers = allUsers.filter((user: Teacher) => user.role === 'TEACHER');

  // Filtrer selon les critères de recherche
  const filteredTeachers = teachers.filter((teacher: Teacher) => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterPacte === 'all' || 
                         (filterPacte === 'pacte' && teacher.inPacte) ||
                         (filterPacte === 'non-pacte' && !teacher.inPacte);
    
    return matchesSearch && matchesFilter;
  });

  // Mutation pour changer le statut PACTE
  const changePacteMutation = useMutation({
    mutationFn: ({ teacherId, newStatus, reason }: { teacherId: number; newStatus: boolean; reason: string }) =>
      apiRequest(`/api/admin/users/${teacherId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          inPacte: newStatus,
          pacteChangeReason: reason,
          pacteChangedAt: new Date().toISOString()
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Statut PACTE modifié",
        description: `${selectedTeacher?.name} est maintenant ${variables.newStatus ? 'en PACTE' : 'hors PACTE'}`,
      });
      setIsDialogOpen(false);
      setSelectedTeacher(null);
      setChangeReason('');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut PACTE",
        variant: "destructive",
      });
    },
  });

  // Ouvrir le dialog de changement de statut
  const openChangeDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setChangeReason('');
    setIsDialogOpen(true);
  };

  // Confirmer le changement de statut
  const confirmChange = () => {
    if (!selectedTeacher || !changeReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif du changement de statut PACTE",
        variant: "destructive",
      });
      return;
    }

    changePacteMutation.mutate({
      teacherId: selectedTeacher.id,
      newStatus: !selectedTeacher.inPacte,
      reason: changeReason.trim()
    });
  };

  // Statistiques
  const stats = {
    total: teachers.length,
    pacte: teachers.filter(t => t.inPacte).length,
    nonPacte: teachers.filter(t => !t.inPacte).length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Gestion des PACTE</h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enseignants</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En PACTE</p>
                <p className="text-2xl font-bold text-green-600">{stats.pacte}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hors PACTE</p>
                <p className="text-2xl font-bold text-gray-600">{stats.nonPacte}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher un enseignant</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Statut PACTE</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={filterPacte === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPacte('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={filterPacte === 'pacte' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPacte('pacte')}
                >
                  PACTE
                </Button>
                <Button
                  variant={filterPacte === 'non-pacte' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPacte('non-pacte')}
                >
                  Hors PACTE
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des enseignants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Enseignants</CardTitle>
          <CardDescription>
            Cliquez sur le bouton "Changer" pour modifier le statut PACTE d'un enseignant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Initiales</TableHead>
                <TableHead>Statut PACTE</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement des enseignants...
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucun enseignant trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher: Teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.username}</TableCell>
                    <TableCell>{teacher.initials}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={teacher.inPacte 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-gray-50 text-gray-600 border-gray-200"
                        }
                      >
                        {teacher.inPacte ? 'En PACTE' : 'Hors PACTE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openChangeDialog(teacher)}
                        disabled={changePacteMutation.isPending}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Changer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de changement de statut */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Modifier le statut PACTE
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Enseignant :</strong> {selectedTeacher.name}</p>
                <p><strong>Statut actuel :</strong> {selectedTeacher.inPacte ? 'En PACTE' : 'Hors PACTE'}</p>
                <p><strong>Nouveau statut :</strong> {selectedTeacher.inPacte ? 'Hors PACTE' : 'En PACTE'}</p>
              </div>
              
              <div>
                <Label htmlFor="reason">Motif du changement *</Label>
                <Textarea
                  id="reason"
                  placeholder="Indiquez le motif du changement de statut PACTE..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmChange}
              disabled={changePacteMutation.isPending || !changeReason.trim()}
            >
              {changePacteMutation.isPending ? 'Modification...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
