import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import type { Session } from "@shared/schema-pg";

interface StatisticsCardsProps {
  sessions: Session[];
  previousPeriodSessions?: Session[];
}

export function StatisticsCards({ sessions, previousPeriodSessions = [] }: StatisticsCardsProps) {
  // Calcul des statistiques actuelles
  const currentStats = {
    total: sessions.length,
    pending: sessions.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_VALIDATION').length,
    validated: sessions.filter(s => s.status === 'VALIDATED').length,
    paid: sessions.filter(s => s.status === 'PAID').length,
    rcd: sessions.filter(s => s.type === 'RCD').length,
    devoirsFaits: sessions.filter(s => s.type === 'DEVOIRS_FAITS').length,
    hse: sessions.filter(s => s.type === 'HSE').length,
    teachers: new Set(sessions.map(s => s.teacherId)).size,
  };

  // Calcul des statistiques de la période précédente pour comparaison
  const previousStats = {
    total: previousPeriodSessions.length,
    pending: previousPeriodSessions.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'PENDING_VALIDATION').length,
    validated: previousPeriodSessions.filter(s => s.status === 'VALIDATED').length,
    paid: previousPeriodSessions.filter(s => s.status === 'PAID').length,
  };

  // Calcul des tendances
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: 'stable' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable' as const
    };
  };

  const totalTrend = getTrend(currentStats.total, previousStats.total);
  const pendingTrend = getTrend(currentStats.pending, previousStats.pending);
  const validatedTrend = getTrend(currentStats.validated, previousStats.validated);

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  // Calcul du taux de validation
  const validationRate = currentStats.total > 0 
    ? ((currentStats.validated + currentStats.paid) / currentStats.total) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total des sessions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des sessions</p>
              <p className="text-3xl font-bold text-gray-900">{currentStats.total}</p>
              <div className="flex items-center mt-2">
                <TrendIcon direction={totalTrend.direction} />
                <span className={`text-sm ml-1 ${getTrendColor(totalTrend.direction)}`}>
                  {totalTrend.value.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
              </div>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Sessions en attente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-orange-600">{currentStats.pending}</p>
              <div className="flex items-center mt-2">
                <TrendIcon direction={pendingTrend.direction} />
                <span className={`text-sm ml-1 ${getTrendColor(pendingTrend.direction)}`}>
                  {pendingTrend.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Sessions validées */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-3xl font-bold text-green-600">{currentStats.validated}</p>
              <div className="flex items-center mt-2">
                <TrendIcon direction={validatedTrend.direction} />
                <span className={`text-sm ml-1 ${getTrendColor(validatedTrend.direction)}`}>
                  {validatedTrend.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Enseignants actifs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enseignants actifs</p>
              <p className="text-3xl font-bold text-purple-600">{currentStats.teachers}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {currentStats.total > 0 ? (currentStats.total / currentStats.teachers).toFixed(1) : '0'} sessions/enseignant
                </p>
              </div>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Taux de validation */}
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de validation</p>
                <p className="text-2xl font-bold text-gray-900">{validationRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={validationRate} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sessions traitées: {currentStats.validated + currentStats.paid}</span>
              <span>Total: {currentStats.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Répartition par type d'activité</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Remplacements (RCD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentStats.rcd}</span>
                  <Badge variant="outline">
                    {currentStats.total > 0 ? ((currentStats.rcd / currentStats.total) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <Progress value={currentStats.total > 0 ? (currentStats.rcd / currentStats.total) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Devoirs Faits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentStats.devoirsFaits}</span>
                  <Badge variant="outline">
                    {currentStats.total > 0 ? ((currentStats.devoirsFaits / currentStats.total) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <Progress value={currentStats.total > 0 ? (currentStats.devoirsFaits / currentStats.total) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">HSE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentStats.hse}</span>
                  <Badge variant="outline">
                    {currentStats.total > 0 ? ((currentStats.hse / currentStats.total) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <Progress value={currentStats.total > 0 ? (currentStats.hse / currentStats.total) * 100 : 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
