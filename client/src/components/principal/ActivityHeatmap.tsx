import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from 'lucide-react';
import type { Session } from "@shared/schema-pg";

interface ActivityHeatmapProps {
  sessions: Session[];
}

export function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  // Générer les données pour la heatmap (4 dernières semaines)
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    
    // Générer 4 semaines
    for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (weekOffset * 7) - today.getDay() + 1); // Lundi de la semaine
      
      const week = {
        weekStart: weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        days: []
      };
      
      // Générer 7 jours pour cette semaine
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + dayOffset);
        
        const dayString = currentDay.toISOString().split('T')[0];
        const daySessions = sessions.filter(s => s.date === dayString);
        
        week.days.push({
          date: currentDay,
          dateString: dayString,
          dayName: currentDay.toLocaleDateString('fr-FR', { weekday: 'short' }),
          sessionCount: daySessions.length,
          sessions: daySessions
        });
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };

  const heatmapData = generateHeatmapData();
  
  // Fonction pour obtenir la couleur selon l'intensité
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-blue-200';
    if (count <= 4) return 'bg-blue-400';
    if (count <= 6) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  const getIntensityText = (count: number) => {
    if (count === 0) return 'text-gray-600';
    if (count <= 2) return 'text-blue-800';
    if (count <= 4) return 'text-white';
    return 'text-white';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activité hebdomadaire (4 dernières semaines)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Légende */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Moins d'activité</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
            </div>
            <span className="text-gray-600">Plus d'activité</span>
          </div>

          {/* Heatmap */}
          <div className="space-y-2">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-8 gap-1">
              <div className="text-xs text-gray-500 text-center"></div>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-xs text-gray-500 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Lignes de semaines */}
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1">
                {/* Label de la semaine */}
                <div className="text-xs text-gray-500 text-right pr-2 flex items-center">
                  {week.weekStart}
                </div>
                
                {/* Jours de la semaine */}
                {week.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium
                      ${getIntensityColor(day.sessionCount)}
                      ${getIntensityText(day.sessionCount)}
                      hover:ring-2 hover:ring-blue-300 cursor-pointer
                      transition-all duration-200
                    `}
                    title={`${day.date.toLocaleDateString('fr-FR')} - ${day.sessionCount} session(s)`}
                  >
                    {day.sessionCount > 0 ? day.sessionCount : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Statistiques de la période */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-gray-500">Total sessions</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {Math.round(sessions.length / 28 * 10) / 10}
                </div>
                <div className="text-gray-500">Moyenne/jour</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {Math.max(...heatmapData.flatMap(w => w.days.map(d => d.sessionCount)))}
                </div>
                <div className="text-gray-500">Pic journalier</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
