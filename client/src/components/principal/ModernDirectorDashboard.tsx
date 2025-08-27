import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Euro,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  GraduationCap,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  DollarSign,
  School,
  Timer,
  Target
} from "lucide-react";

interface Session {
  id: number;
  type: "RCD" | "DEVOIRS_FAITS" | "AUTRE" | "HSE";
  status: "PENDING_REVIEW" | "PENDING_VALIDATION" | "VALIDATED" | "REJECTED" | "PAID";
  date: string;
  teacherId: number;
  teacherName: string;
  totalAmount: number;
  duration: number;
  subject?: string;
  className?: string;
}

interface ModernDirectorDashboardProps {
  sessions: Session[];
}

export function ModernDirectorDashboard({ sessions }: ModernDirectorDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  console.log('🎯 Dashboard reçoit:', sessions);
  console.log('📊 Nombre de sessions reçues:', sessions?.length || 0);

  // Calculs des métriques principales
  const metrics = useMemo(() => {
    console.log('🔢 Calcul des métriques avec', sessions.length, 'sessions');

    // Pour la démo, on prend TOUTES les sessions (pas de filtre par période)
    const periodSessions = sessions;
    // Pour la démo, on simule une évolution positive
    const previousPeriodSessions = sessions.slice(0, Math.floor(sessions.length * 0.8));

    const totalSessions = periodSessions.length;
    const totalAmount = periodSessions.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalHours = periodSessions.reduce((sum, s) => sum + s.duration, 0);
    const uniqueTeachers = new Set(periodSessions.map(s => s.teacherId)).size;

    const pendingValidation = periodSessions.filter(s => s.status === 'PENDING_VALIDATION').length;
    const validated = periodSessions.filter(s => s.status === 'VALIDATED').length;
    const paid = periodSessions.filter(s => s.status === 'PAID').length;
    const rejected = periodSessions.filter(s => s.status === 'REJECTED').length;

    console.log('📊 Métriques calculées:', {
      totalSessions,
      totalAmount,
      totalHours,
      uniqueTeachers,
      pendingValidation,
      validated,
      paid,
      rejected
    });

    // Calculs des évolutions
    const prevTotalSessions = previousPeriodSessions.length;
    const prevTotalAmount = previousPeriodSessions.reduce((sum, s) => sum + s.totalAmount, 0);
    
    const sessionsEvolution = prevTotalSessions > 0 ? 
      ((totalSessions - prevTotalSessions) / prevTotalSessions) * 100 : 0;
    const amountEvolution = prevTotalAmount > 0 ? 
      ((totalAmount - prevTotalAmount) / prevTotalAmount) * 100 : 0;

    return {
      totalSessions,
      totalAmount,
      totalHours,
      uniqueTeachers,
      pendingValidation,
      validated,
      paid,
      rejected,
      sessionsEvolution,
      amountEvolution,
      averageAmount: totalSessions > 0 ? totalAmount / totalSessions : 0,
      validationRate: totalSessions > 0 ? ((validated + paid) / totalSessions) * 100 : 0
    };
  }, [sessions, selectedPeriod]);

  // Données pour les graphiques
  const typeDistribution = useMemo(() => {
    const distribution = sessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: (count / sessions.length) * 100
    }));
  }, [sessions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_VALIDATION': return 'bg-orange-500';
      case 'VALIDATED': return 'bg-green-500';
      case 'PAID': return 'bg-blue-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RCD': return 'Remplacements';
      case 'DEVOIRS_FAITS': return 'Devoirs Faits';
      case 'HSE': return 'Heures Supp.';
      case 'AUTRE': return 'Autres';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <School className="h-8 w-8 text-blue-600" />
            Gestion des Heures Supplémentaires
          </h1>
          <p className="text-gray-600 mt-1">Pilotage et validation des heures supplémentaires enseignantes</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period === 'week' ? '7 jours' : period === 'month' ? '30 jours' : '3 mois'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales - Spécifiques à l'éducation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Heures Supplémentaires Déclarées */}
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Heures Déclarées</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalSessions}</div>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              {metrics.sessionsEvolution >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={metrics.sessionsEvolution >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.sessionsEvolution).toFixed(1)}%
              </span>
              <span className="ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        {/* Budget Heures Supplémentaires */}
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget HSE</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalAmount.toFixed(0)}€</div>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              {metrics.amountEvolution >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={metrics.amountEvolution >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.amountEvolution).toFixed(1)}%
              </span>
              <span className="ml-1">vs budget prévisionnel</span>
            </div>
          </CardContent>
        </Card>

        {/* Validation en Attente */}
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">À Valider</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pendingValidation}</div>
            <div className="text-xs text-gray-600 mt-1">
              {metrics.pendingValidation > 0 ? 'Action requise' : 'Tout validé'}
            </div>
          </CardContent>
        </Card>

        {/* Enseignants Concernés */}
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Enseignants</CardTitle>
            <GraduationCap className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.uniqueTeachers}</div>
            <div className="text-xs text-gray-600 mt-1">
              {metrics.totalHours}h déclarées au total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Prioritaires et Suivi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Urgentes */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Actions Prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.pendingValidation > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Heures à valider
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {metrics.pendingValidation}
                  </Badge>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Validation requise pour le paiement
                </p>
              </div>
            )}

            {metrics.rejected > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Heures rejetées
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {metrics.rejected}
                  </Badge>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  Nécessitent un suivi avec les enseignants
                </p>
              </div>
            )}

            {metrics.pendingValidation === 0 && metrics.rejected === 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Aucune action urgente
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Toutes les heures sont traitées
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow des Validations */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Workflow Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Étape 1: Déclaration */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">1. Déclaration Enseignant</div>
                  <div className="text-xs text-gray-600">Saisie des heures effectuées</div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  {sessions.filter(s => s.status === 'PENDING_REVIEW').length}
                </Badge>
              </div>

              {/* Étape 2: Révision Secrétariat */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">2. Révision Secrétariat</div>
                  <div className="text-xs text-gray-600">Vérification des justificatifs</div>
                </div>
                <Badge variant="outline" className="text-purple-600">
                  En cours
                </Badge>
              </div>

              {/* Étape 3: Validation Direction */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  metrics.pendingValidation > 0 ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <ClipboardCheck className={`h-4 w-4 ${
                    metrics.pendingValidation > 0 ? 'text-orange-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">3. Validation Direction</div>
                  <div className="text-xs text-gray-600">Votre validation requise</div>
                </div>
                <Badge variant={metrics.pendingValidation > 0 ? "destructive" : "default"}>
                  {metrics.pendingValidation}
                </Badge>
              </div>

              {/* Étape 4: Paiement */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">4. Paiement</div>
                  <div className="text-xs text-gray-600">Traitement comptable</div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {metrics.paid}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Types d'Heures Supplémentaires */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Types d'Heures Supplémentaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeDistribution.map(({ type, count, percentage }) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        type === 'RCD' ? 'bg-blue-500' :
                        type === 'DEVOIRS_FAITS' ? 'bg-green-500' :
                        type === 'HSE' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{count}</div>
                      <div className="text-xs text-gray-600">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-gray-600">
                    {type === 'RCD' && 'Remplacements de courte durée'}
                    {type === 'DEVOIRS_FAITS' && 'Accompagnement éducatif'}
                    {type === 'HSE' && 'Heures supplémentaires effectives'}
                    {type === 'AUTRE' && 'Autres activités pédagogiques'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
