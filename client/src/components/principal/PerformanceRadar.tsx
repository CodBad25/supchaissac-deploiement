import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Target, Award } from 'lucide-react';
import type { Session } from "@shared/schema-pg";

interface PerformanceRadarProps {
  sessions: Session[];
}

export function PerformanceRadar({ sessions }: PerformanceRadarProps) {
  // Calculer les métriques de performance
  const calculateMetrics = () => {
    const totalSessions = sessions.length;
    if (totalSessions === 0) return [];

    // Métriques par type d'activité
    const rcdCount = sessions.filter(s => s.type === 'RCD').length;
    const devoirsFaitsCount = sessions.filter(s => s.type === 'DEVOIRS_FAITS').length;
    const hseCount = sessions.filter(s => s.type === 'HSE').length;
    const autreCount = sessions.filter(s => s.type === 'AUTRE').length;

    // Métriques de qualité
    const validatedCount = sessions.filter(s => s.status === 'VALIDATED' || s.status === 'PAID').length;
    const rejectedCount = sessions.filter(s => s.status === 'REJECTED').length;
    
    // Métriques temporelles
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getMonth() === thisMonth && sessionDate.getFullYear() === thisYear;
    });

    // Normaliser les valeurs sur 100
    const maxValue = Math.max(rcdCount, devoirsFaitsCount, hseCount, autreCount, validatedCount, thisMonthSessions.length);
    
    return [
      {
        metric: 'Remplacements',
        value: maxValue > 0 ? (rcdCount / maxValue) * 100 : 0,
        rawValue: rcdCount,
        fullMark: 100
      },
      {
        metric: 'Devoirs Faits',
        value: maxValue > 0 ? (devoirsFaitsCount / maxValue) * 100 : 0,
        rawValue: devoirsFaitsCount,
        fullMark: 100
      },
      {
        metric: 'HSE',
        value: maxValue > 0 ? (hseCount / maxValue) * 100 : 0,
        rawValue: hseCount,
        fullMark: 100
      },
      {
        metric: 'Autres',
        value: maxValue > 0 ? (autreCount / maxValue) * 100 : 0,
        rawValue: autreCount,
        fullMark: 100
      },
      {
        metric: 'Taux validation',
        value: totalSessions > 0 ? (validatedCount / totalSessions) * 100 : 0,
        rawValue: validatedCount,
        fullMark: 100
      },
      {
        metric: 'Activité mensuelle',
        value: maxValue > 0 ? (thisMonthSessions.length / maxValue) * 100 : 0,
        rawValue: thisMonthSessions.length,
        fullMark: 100
      }
    ];
  };

  const radarData = calculateMetrics();
  
  // Calcul du score global
  const globalScore = radarData.length > 0 
    ? Math.round(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const, className: 'bg-green-600' };
    if (score >= 60) return { label: 'Bon', variant: 'default' as const, className: 'bg-blue-600' };
    if (score >= 40) return { label: 'Moyen', variant: 'secondary' as const, className: '' };
    return { label: 'Faible', variant: 'destructive' as const, className: '' };
  };

  const scoreBadge = getScoreBadge(globalScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Graphique radar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analyse de performance globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                formatter={(value: number, name, props) => [
                  `${props.payload.rawValue} (${value.toFixed(1)}%)`,
                  'Valeur'
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score global et métriques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Score de performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score global */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(globalScore)}`}>
              {globalScore}
            </div>
            <div className="text-sm text-gray-500 mb-2">Score global</div>
            <Badge variant={scoreBadge.variant} className={scoreBadge.className}>
              {scoreBadge.label}
            </Badge>
          </div>

          {/* Métriques détaillées */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Détail des métriques</h4>
            {radarData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className="text-sm text-gray-600">
                    {item.rawValue} ({item.value.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommandations */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recommandations</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {globalScore >= 80 ? (
                <p className="text-green-600">✅ Performance excellente, continuez ainsi !</p>
              ) : globalScore >= 60 ? (
                <p className="text-blue-600">📈 Bonne performance, quelques améliorations possibles</p>
              ) : globalScore >= 40 ? (
                <p className="text-orange-600">⚠️ Performance moyenne, surveillance recommandée</p>
              ) : (
                <p className="text-red-600">🚨 Performance faible, action requise</p>
              )}
              
              {radarData.find(m => m.metric === 'Taux validation' && m.value < 80) && (
                <p>• Améliorer le taux de validation des sessions</p>
              )}
              
              {radarData.find(m => m.metric === 'Activité mensuelle' && m.value < 50) && (
                <p>• Encourager plus d'activité ce mois-ci</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
