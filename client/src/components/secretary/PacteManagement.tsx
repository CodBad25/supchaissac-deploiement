import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  History, 
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  username: string;
  initials: string;
  inPacte: boolean;
  stats: {
    totalSessions: number;
    currentYearSessions: number;
    rcdSessions: number;
    devoirsFaitsSessions: number;
    hseSessions: number;
    validatedSessions: number;
  };
}

interface PacteStats {
  totalTeachers: number;
  teachersWithPacte: number;
  teachersWithoutPacte: number;
  pactePercentage: number;
  sessionsWithPacte: number;
  sessionsWithoutPacte: number;
  pacteRcd: number;
  pacteDevoirs: number;
  pacteHse: number;
  nonPacteRcd: number;
  nonPacteDevoirs: number;
  nonPacteHse: number;
}

export function PacteManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<PacteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pacte' | 'non-pacte'>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    inPacte: false,
    reason: '',
    schoolYear: '2024-2025'
  });
  const { toast } = useToast();

  // Charger les données
  useEffect(() => {
    loadTeachers();
    loadStats();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/pacte/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des enseignants",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/pacte/statistics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Filtrer les enseignants
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pacte' && teacher.inPacte) ||
                         (statusFilter === 'non-pacte' && !teacher.inPacte);
    
    return matchesSearch && matchesStatus;
  });

  // Ouvrir la boîte de dialogue d'édition
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      inPacte: teacher.inPacte,
      reason: '',
      schoolYear: '2024-2025'
    });
    setShowEditDialog(true);
  };

  // Sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/pacte/teachers/${selectedTeacher.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Statut PACTE mis à jour pour ${selectedTeacher.name}`,
        });
        setShowEditDialog(false);
        loadTeachers();
        loadStats();
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total enseignants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avec PACTE</p>
                  <p className="text-2xl font-bold text-green-600">{stats.teachersWithPacte}</p>
                  <p className="text-xs text-gray-500">{stats.pactePercentage}%</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sans PACTE</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.teachersWithoutPacte}</p>
                  <p className="text-xs text-gray-500">{100 - stats.pactePercentage}%</p>
                </div>
                <UserX className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions PACTE</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.sessionsWithPacte}</p>
                  <p className="text-xs text-gray-500">vs {stats.sessionsWithoutPacte} non-PACTE</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher un enseignant</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label>Filtrer par statut</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pacte">Avec PACTE</SelectItem>
                  <SelectItem value="non-pacte">Sans PACTE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des enseignants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des statuts PACTE ({filteredTeachers.length} enseignants)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Statut PACTE</TableHead>
                  <TableHead className="text-center">Sessions année</TableHead>
                  <TableHead className="text-center">RCD</TableHead>
                  <TableHead className="text-center">Devoirs Faits</TableHead>
                  <TableHead className="text-center">HSE</TableHead>
                  <TableHead className="text-center">Validées</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                          {teacher.initials}
                        </div>
                        {teacher.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {teacher.username}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={teacher.inPacte ? "default" : "secondary"}>
                        {teacher.inPacte ? "PACTE" : "Non-PACTE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {teacher.stats.currentYearSessions}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {teacher.stats.rcdSessions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {teacher.stats.devoirsFaitsSessions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {teacher.stats.hseSessions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={teacher.stats.validatedSessions > 0 ? "default" : "outline"}>
                        {teacher.stats.validatedSessions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Voir historique */}}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun enseignant ne correspond aux critères de recherche
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le statut PACTE</DialogTitle>
            <DialogDescription>
              Enseignant : {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="pacte-status"
                checked={editForm.inPacte}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, inPacte: checked }))}
              />
              <Label htmlFor="pacte-status" className="text-sm font-medium">
                {editForm.inPacte ? "Enseignant avec PACTE" : "Enseignant sans PACTE"}
              </Label>
            </div>
            
            <div>
              <Label htmlFor="school-year">Année scolaire</Label>
              <Select 
                value={editForm.schoolYear} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, schoolYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reason">Raison du changement</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez la raison de ce changement de statut..."
                value={editForm.reason}
                onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveChanges}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
