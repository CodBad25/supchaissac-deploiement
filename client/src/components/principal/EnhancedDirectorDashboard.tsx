import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  FileText,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter
} from 'lucide-react';
import { useSession } from "@/hooks/use-session";
import { StatisticsCards } from "./StatisticsCards";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { PerformanceRadar } from "./PerformanceRadar";
import type { Session } from "@shared/schema-pg";

// Couleurs pour les graphiques
const COLORS = {
  RCD: '#8B5CF6',           // Violet
  DEVOIRS_FAITS: '#3B82F6', // Bleu
  HSE: '#10B981',           // Vert
  AUTRE: '#F59E0B',         // Orange
  PENDING_REVIEW: '#EF4444',     // Rouge
  PENDING_VALIDATION: '#F59E0B', // Orange
  VALIDATED: '#10B981',          // Vert
  PAID: '#6B7280'               // Gris
};

interface EnhancedDirectorDashboardProps {
  sessions: Session[];
}

export function EnhancedDirectorDashboard({ sessions }: EnhancedDirectorDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedView, setSelectedView] = useState('overview');

  // Filtrer les sessions selon la période sélectionnée
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (selectedPeriod) {
      case 'current-month':
        return sessions.filter(s => {
          const sessionDate = new Date(s.date);
          return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        });
      case 'last-month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return sessions.filter(s => {
          const sessionDate = new Date(s.date);
          return sessionDate.getMonth() === lastMonth && sessionDate.getFullYear() === lastMonthYear;
        });
      case 'current-year':
        return sessions.filter(s => new Date(s.date).getFullYear() === currentYear);
      default:
        return sessions;
    }
  }, [sessions, selectedPeriod]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const byType = {
      RCD: filteredSessions.filter(s => s.type === 'RCD').length,
      DEVOIRS_FAITS: filteredSessions.filter(s => s.type === 'DEVOIRS_FAITS').length,
      HSE: filteredSessions.filter(s => s.type === 'HSE').length,
      AUTRE: filteredSessions.filter(s => s.type === 'AUTRE').length,
    };
    
    const byStatus = {
      PENDING_REVIEW: filteredSessions.filter(s => s.status === 'PENDING_REVIEW').length,
      PENDING_VALIDATION: filteredSessions.filter(s => s.status === 'PENDING_VALIDATION').length,
      VALIDATED: filteredSessions.filter(s => s.status === 'VALIDATED').length,
      PAID: filteredSessions.filter(s => s.status === 'PAID').length,
    };

    // Données pour le graphique en barres par enseignant
    const teacherStats = Object.entries(
      filteredSessions.reduce((acc, session) => {
        const teacher = session.teacherName;
        if (!acc[teacher]) {
          acc[teacher] = { name: teacher, RCD: 0, DEVOIRS_FAITS: 0, HSE: 0, AUTRE: 0, total: 0 };
        }
        acc[teacher][session.type as keyof typeof acc[typeof teacher]]++;
        acc[teacher].total++;
        return acc;
      }, {} as Record<string, any>)
    ).map(([_, data]) => data).sort((a, b) => b.total - a.total);

    // Données pour le graphique en secteurs par type
    const pieDataByType = Object.entries(byType)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: type === 'RCD' ? 'Remplacements' : 
              type === 'DEVOIRS_FAITS' ? 'Devoirs Faits' :
              type === 'HSE' ? 'HSE' : 'Autres',
        value: count,
        color: COLORS[type as keyof typeof COLORS]
      }));

    // Données pour le graphique en secteurs par statut
    const pieDataByStatus = Object.entries(byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status === 'PENDING_REVIEW' ? 'En révision' :
              status === 'PENDING_VALIDATION' ? 'En validation' :
              status === 'VALIDATED' ? 'Validées' : 'Payées',
        value: count,
        color: COLORS[status as keyof typeof COLORS]
      }));

    // Évolution mensuelle (6 derniers mois)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.getMonth() === month && sessionDate.getFullYear() === year;
      });

      monthlyData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        total: monthSessions.length,
        RCD: monthSessions.filter(s => s.type === 'RCD').length,
        DEVOIRS_FAITS: monthSessions.filter(s => s.type === 'DEVOIRS_FAITS').length,
        HSE: monthSessions.filter(s => s.type === 'HSE').length,
        AUTRE: monthSessions.filter(s => s.type === 'AUTRE').length,
      });
    }

    return {
      total,
      byType,
      byStatus,
      teacherStats: teacherStats.slice(0, 10), // Top 10 enseignants
      pieDataByType,
      pieDataByStatus,
      monthlyData
    };
  }, [filteredSessions, sessions]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'current-month': return 'Mois en cours';
      case 'last-month': return 'Mois dernier';
      case 'current-year': return 'Année en cours';
      default: return 'Toutes les données';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Direction</h1>
          <p className="text-gray-600">Analyse des heures supplémentaires - {getPeriodLabel(selectedPeriod)}</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mois en cours</SelectItem>
              <SelectItem value="last-month">Mois dernier</SelectItem>
              <SelectItem value="current-year">Année en cours</SelectItem>
              <SelectItem value="all">Toutes les données</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="flex gap-2">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedView('overview')}
          size="sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vue d'ensemble
        </Button>
        <Button
          variant={selectedView === 'teachers' ? 'default' : 'outline'}
          onClick={() => setSelectedView('teachers')}
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" />
          Par enseignant
        </Button>
        <Button
          variant={selectedView === 'trends' ? 'default' : 'outline'}
          onClick={() => setSelectedView('trends')}
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Tendances
        </Button>
      </div>

      {/* Métriques principales avec tendances */}
      <StatisticsCards sessions={filteredSessions} />

      {/* Contenu selon la vue sélectionnée */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Heatmap d'activité */}
          <ActivityHeatmap sessions={filteredSessions} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique en secteurs - Répartition par type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Répartition par type d'activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.pieDataByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stats.pieDataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique en secteurs - Répartition par statut */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Répartition par statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.pieDataByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stats.pieDataByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedView === 'teachers' && (
        <div className="space-y-6">
          {/* Graphique en barres par enseignant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activité par enseignant (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.teacherStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'RCD' ? 'Remplacements' :
                                                      name === 'DEVOIRS_FAITS' ? 'Devoirs Faits' :
                                                      name === 'HSE' ? 'HSE' : 'Autres']}
                  />
                  <Bar dataKey="RCD" stackId="a" fill={COLORS.RCD} name="RCD" />
                  <Bar dataKey="DEVOIRS_FAITS" stackId="a" fill={COLORS.DEVOIRS_FAITS} name="DEVOIRS_FAITS" />
                  <Bar dataKey="HSE" stackId="a" fill={COLORS.HSE} name="HSE" />
                  <Bar dataKey="AUTRE" stackId="a" fill={COLORS.AUTRE} name="AUTRE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tableau détaillé des enseignants */}
          <Card>
            <CardHeader>
              <CardTitle>Détail par enseignant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Enseignant</th>
                      <th className="text-center py-2 font-medium">RCD</th>
                      <th className="text-center py-2 font-medium">Devoirs Faits</th>
                      <th className="text-center py-2 font-medium">HSE</th>
                      <th className="text-center py-2 font-medium">Autres</th>
                      <th className="text-center py-2 font-medium">Total</th>
                      <th className="text-center py-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.teacherStats.map((teacher, index) => (
                      <tr key={teacher.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{teacher.name}</td>
                        <td className="text-center py-3">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {teacher.RCD}
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {teacher.DEVOIRS_FAITS}
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {teacher.HSE}
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {teacher.AUTRE}
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge variant="default">
                            {teacher.total}
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          {teacher.total >= 10 ? (
                            <Badge variant="default" className="bg-green-600">Très actif</Badge>
                          ) : teacher.total >= 5 ? (
                            <Badge variant="secondary">Actif</Badge>
                          ) : (
                            <Badge variant="outline">Modéré</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'trends' && (
        <div className="space-y-6">
          {/* Analyse de performance radar */}
          <PerformanceRadar sessions={filteredSessions} />

          {/* Évolution mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution sur 6 mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Total des sessions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Détail par type sur 6 mois */}
          <Card>
            <CardHeader>
              <CardTitle>Détail par type d'activité</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="RCD" stroke={COLORS.RCD} strokeWidth={2} name="Remplacements" />
                  <Line type="monotone" dataKey="DEVOIRS_FAITS" stroke={COLORS.DEVOIRS_FAITS} strokeWidth={2} name="Devoirs Faits" />
                  <Line type="monotone" dataKey="HSE" stroke={COLORS.HSE} strokeWidth={2} name="HSE" />
                  <Line type="monotone" dataKey="AUTRE" stroke={COLORS.AUTRE} strokeWidth={2} name="Autres" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Résumé textuel */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Types d'activités</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Remplacements (RCD):</span>
                  <span className="font-medium">{stats.byType.RCD}</span>
                </div>
                <div className="flex justify-between">
                  <span>Devoirs Faits:</span>
                  <span className="font-medium">{stats.byType.DEVOIRS_FAITS}</span>
                </div>
                <div className="flex justify-between">
                  <span>HSE:</span>
                  <span className="font-medium">{stats.byType.HSE}</span>
                </div>
                <div className="flex justify-between">
                  <span>Autres:</span>
                  <span className="font-medium">{stats.byType.AUTRE}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">États de validation</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>En révision:</span>
                  <span className="font-medium text-red-600">{stats.byStatus.PENDING_REVIEW}</span>
                </div>
                <div className="flex justify-between">
                  <span>En validation:</span>
                  <span className="font-medium text-orange-600">{stats.byStatus.PENDING_VALIDATION}</span>
                </div>
                <div className="flex justify-between">
                  <span>Validées:</span>
                  <span className="font-medium text-green-600">{stats.byStatus.VALIDATED}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payées:</span>
                  <span className="font-medium text-gray-600">{stats.byStatus.PAID}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Enseignants actifs</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Nombre d'enseignants:</span>
                  <span className="font-medium">{stats.teacherStats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyenne par enseignant:</span>
                  <span className="font-medium">
                    {stats.teacherStats.length > 0 ? 
                      (stats.total / stats.teacherStats.length).toFixed(1) : '0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Plus actif:</span>
                  <span className="font-medium">
                    {stats.teacherStats[0]?.name || 'N/A'} ({stats.teacherStats[0]?.total || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
