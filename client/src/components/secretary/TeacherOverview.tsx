import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSession } from "@/hooks/use-session";

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

const COLORS = {
  RCD: '#8B5CF6',
  DEVOIRS_FAITS: '#3B82F6', 
  HSE: '#10B981',
  AUTRE: '#F59E0B',
  PACTE: '#10B981',
  NON_PACTE: '#F59E0B'
};

export function TeacherOverview() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sessions' | 'pacte'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { sessions } = useSession();

  // Charger les enseignants
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetch('/api/pacte/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les enseignants
  const filteredAndSortedTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'sessions':
        filtered.sort((a, b) => b.stats.currentYearSessions - a.stats.currentYearSessions);
        break;
      case 'pacte':
        filtered.sort((a, b) => {
          if (a.inPacte === b.inPacte) return a.name.localeCompare(b.name);
          return a.inPacte ? -1 : 1;
        });
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [teachers, searchTerm, sortBy]);

  // Statistiques pour les graphiques
  const chartData = useMemo(() => {
    const pacteTeachers = teachers.filter(t => t.inPacte);
    const nonPacteTeachers = teachers.filter(t => !t.inPacte);

    return {
      statusDistribution: [
        { name: 'Avec PACTE', value: pacteTeachers.length, color: COLORS.PACTE },
        { name: 'Sans PACTE', value: nonPacteTeachers.length, color: COLORS.NON_PACTE }
      ],
      activityComparison: [
        {
          category: 'PACTE',
          RCD: pacteTeachers.reduce((sum, t) => sum + t.stats.rcdSessions, 0),
          DEVOIRS_FAITS: pacteTeachers.reduce((sum, t) => sum + t.stats.devoirsFaitsSessions, 0),
          HSE: pacteTeachers.reduce((sum, t) => sum + t.stats.hseSessions, 0),
        },
        {
          category: 'Non-PACTE',
          RCD: nonPacteTeachers.reduce((sum, t) => sum + t.stats.rcdSessions, 0),
          DEVOIRS_FAITS: nonPacteTeachers.reduce((sum, t) => sum + t.stats.devoirsFaitsSessions, 0),
          HSE: nonPacteTeachers.reduce((sum, t) => sum + t.stats.hseSessions, 0),
        }
      ]
    };
  }, [teachers]);

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
      {/* Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Répartition PACTE/Non-PACTE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activité PACTE vs Non-PACTE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.activityComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="RCD" stackId="a" fill={COLORS.RCD} name="RCD" />
                <Bar dataKey="DEVOIRS_FAITS" stackId="a" fill={COLORS.DEVOIRS_FAITS} name="Devoirs Faits" />
                <Bar dataKey="HSE" stackId="a" fill={COLORS.HSE} name="HSE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
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
            
            <div>
              <Label>Trier par</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="sessions">Nb sessions</SelectItem>
                  <SelectItem value="pacte">Statut PACTE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tableau
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cartes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage selon le mode sélectionné */}
      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vue d'ensemble des enseignants ({filteredAndSortedTeachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-center">Sessions</TableHead>
                    <TableHead className="text-center">Taux validation</TableHead>
                    <TableHead className="text-center">Activité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTeachers.map((teacher) => {
                    const validationRate = teacher.stats.currentYearSessions > 0 
                      ? (teacher.stats.validatedSessions / teacher.stats.currentYearSessions) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                              {teacher.initials}
                            </div>
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-gray-500">{teacher.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={teacher.inPacte ? "default" : "secondary"}>
                            {teacher.inPacte ? "PACTE" : "Non-PACTE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">{teacher.stats.currentYearSessions}</div>
                          <div className="text-xs text-gray-500">cette année</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="font-medium">{validationRate.toFixed(0)}%</div>
                            <Progress value={validationRate} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            {teacher.stats.rcdSessions > 0 && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                                RCD: {teacher.stats.rcdSessions}
                              </Badge>
                            )}
                            {teacher.stats.devoirsFaitsSessions > 0 && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                DF: {teacher.stats.devoirsFaitsSessions}
                              </Badge>
                            )}
                            {teacher.stats.hseSessions > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                HSE: {teacher.stats.hseSessions}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTeachers.map((teacher) => {
            const validationRate = teacher.stats.currentYearSessions > 0 
              ? (teacher.stats.validatedSessions / teacher.stats.currentYearSessions) * 100 
              : 0;
            
            return (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-medium">
                      {teacher.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.username}</div>
                    </div>
                    <Badge variant={teacher.inPacte ? "default" : "secondary"}>
                      {teacher.inPacte ? "PACTE" : "Non-PACTE"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sessions cette année</span>
                      <span className="font-medium">{teacher.stats.currentYearSessions}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taux de validation</span>
                        <span className="font-medium">{validationRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={validationRate} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-purple-50 rounded p-2">
                        <div className="text-sm font-medium text-purple-700">{teacher.stats.rcdSessions}</div>
                        <div className="text-xs text-purple-600">RCD</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2">
                        <div className="text-sm font-medium text-blue-700">{teacher.stats.devoirsFaitsSessions}</div>
                        <div className="text-xs text-blue-600">DF</div>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-sm font-medium text-green-700">{teacher.stats.hseSessions}</div>
                        <div className="text-xs text-green-600">HSE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        {validationRate >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : validationRate >= 60 ? (
                          <Clock className="h-4 w-4 text-orange-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          {validationRate >= 80 ? 'Excellent' : 
                           validationRate >= 60 ? 'Bon' : 'À surveiller'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {teacher.stats.validatedSessions}/{teacher.stats.currentYearSessions} validées
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {filteredAndSortedTeachers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
            <p className="text-gray-500">Aucun enseignant ne correspond à votre recherche.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
