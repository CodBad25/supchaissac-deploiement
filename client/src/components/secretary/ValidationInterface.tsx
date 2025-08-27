import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Paperclip
} from "lucide-react";

interface Session {
  id: number;
  teacherId: number;
  teacherName: string;
  date: string;
  timeSlot: string;
  type: string;
  status: string;
  className?: string;
  studentCount?: number;
  gradeLevel?: string;
  description?: string;
  replacedTeacherPrefix?: string;
  replacedTeacherLastName?: string;
  replacedTeacherFirstName?: string;
}

interface Attachment {
  id: number;
  sessionId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  isVerified: boolean;
  createdAt: string;
}

export function ValidationInterface() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [sessionToReject, setSessionToReject] = useState<Session | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [sessionToPending, setSessionToPending] = useState<Session | null>(null);
  const [pendingComment, setPendingComment] = useState('');

  // Récupérer les sessions
  const { data: sessions = [], isLoading, refetch } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sessions");
      return response.json();
    }
  });

  // Récupérer les pièces jointes pour une session
  const { data: attachments = [] } = useQuery<Attachment[]>({
    queryKey: [`/api/sessions/${selectedSession?.id}/attachments`],
    queryFn: async () => {
      if (!selectedSession) return [];
      const response = await fetch(`/api/sessions/${selectedSession.id}/attachments`);
      return response.json();
    },
    enabled: !!selectedSession
  });

  // Mutation pour transmettre une session au principal
  const transmitMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
        status: 'PENDING_VALIDATION'
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Session transmise",
        description: "La session a été transmise au principal pour validation",
      });
    }
  });

  // Mutation pour rejeter une session avec demande de justifications
  const rejectMutation = useMutation({
    mutationFn: async ({ sessionId, comment }: { sessionId: number; comment: string }) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
        status: 'REJECTED',
        comment: comment
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Session rejetée",
        description: "La session a été rejetée avec demande de justifications",
        variant: "destructive"
      });
    }
  });

  // Mutation pour mettre une session en attente (demande de pièces jointes)
  const pendingMutation = useMutation({
    mutationFn: async ({ sessionId, comment }: { sessionId: number; comment: string }) => {
      const response = await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
        status: 'PENDING_DOCUMENTS',
        comment: comment
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Session mise en attente",
        description: "L'enseignant a été notifié pour fournir les pièces jointes manquantes",
      });
    }
  });

  // Filtrer les sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      const matchesType = typeFilter === 'all' || session.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchTerm, statusFilter, typeFilter]);

  // Télécharger une pièce jointe
  const downloadAttachment = async (attachment: Attachment, session: Session) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/download`);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nom intelligent
      const date = session.date.replace(/-/g, '');
      const teacherName = session.teacherName.replace(/\s+/g, '_');
      const sessionType = session.type;
      const timeSlot = session.timeSlot;
      
      a.download = `${date}_${teacherName}_${sessionType}_${timeSlot}_${attachment.originalName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Téléchargement réussi",
        description: `Fichier téléchargé : ${a.download}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">À examiner</Badge>;
      case 'PENDING_DOCUMENTS':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">En attente PJ</Badge>;
      case 'PENDING_VALIDATION':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Chez le principal</Badge>;
      case 'VALIDATED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Validé</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'READY_FOR_PAYMENT':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Prêt paiement</Badge>;
      case 'PAID':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Payé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Obtenir le badge de type
  const getTypeBadge = (type: string) => {
    const colors = {
      'RCD': 'bg-blue-100 text-blue-800',
      'DEVOIRS_FAITS': 'bg-purple-100 text-purple-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.AUTRE}>{type}</Badge>;
  };

  // Fonctions pour gérer les actions
  const handleTransmit = (session: Session) => {
    transmitMutation.mutate(session.id);
  };

  const handleReject = (session: Session) => {
    setSessionToReject(session);
    setShowRejectModal(true);
  };

  const handlePending = (session: Session) => {
    setSessionToPending(session);
    setShowPendingModal(true);
  };

  const confirmReject = () => {
    if (sessionToReject && rejectComment.trim()) {
      rejectMutation.mutate({
        sessionId: sessionToReject.id,
        comment: rejectComment.trim()
      });
      setShowRejectModal(false);
      setSessionToReject(null);
      setRejectComment('');
    }
  };

  const confirmPending = () => {
    if (sessionToPending && pendingComment.trim()) {
      pendingMutation.mutate({
        sessionId: sessionToPending.id,
        comment: pendingComment.trim()
      });
      setShowPendingModal(false);
      setSessionToPending(null);
      setPendingComment('');
    }
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Validation des déclarations</h2>
          <p className="text-gray-600">{filteredSessions.length} session(s) à traiter</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING_REVIEW">À valider</SelectItem>
              <SelectItem value="VALIDATED">Validé</SelectItem>
              <SelectItem value="REJECTED">Rejeté</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="RCD">RCD</SelectItem>
              <SelectItem value="DEVOIRS_FAITS">Devoirs Faits</SelectItem>
              <SelectItem value="AUTRE">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des sessions */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
            <p className="text-gray-500">Aucune session ne correspond à vos critères de recherche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onTransmit={() => handleTransmit(session)}
              onReject={() => handleReject(session)}
              onPending={() => handlePending(session)}
              onViewDetails={() => setSelectedSession(session)}
              getStatusBadge={getStatusBadge}
              getTypeBadge={getTypeBadge}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la session</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              attachments={attachments}
              onDownload={downloadAttachment}
              formatFileSize={formatFileSize}
              getStatusBadge={getStatusBadge}
              getTypeBadge={getTypeBadge}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de rejet avec demande de justifications */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la déclaration</DialogTitle>
          </DialogHeader>

          {sessionToReject && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Enseignant :</strong> {sessionToReject.teacherName}</p>
                <p><strong>Date :</strong> {new Date(sessionToReject.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Type :</strong> {sessionToReject.type}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Motif du rejet et justifications demandées <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cette déclaration et quelles justifications sont nécessaires..."
                  className="w-full p-3 border rounded-lg resize-none h-32"
                  required
                />
                <p className="text-xs text-gray-500">
                  Ce commentaire sera envoyé à l'enseignant pour qu'il puisse corriger sa déclaration.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectComment('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmReject}
                  disabled={!rejectComment.trim() || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Rejet en cours...' : 'Rejeter'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal pour mettre en attente (demande de pièces jointes) */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre en attente - Demande de pièces jointes</DialogTitle>
          </DialogHeader>

          {sessionToPending && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Enseignant :</strong> {sessionToPending.teacherName}</p>
                <p><strong>Date :</strong> {new Date(sessionToPending.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Type :</strong> {sessionToPending.type}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Message à l'enseignant <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={pendingComment}
                  onChange={(e) => setPendingComment(e.target.value)}
                  placeholder="Expliquez quelles pièces jointes sont nécessaires pour valider cette déclaration..."
                  className="w-full p-3 border rounded-lg resize-none h-32"
                  required
                />
                <p className="text-xs text-gray-500">
                  L'enseignant recevra une notification et un email automatique avec ce message.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Actions automatiques :</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Notification dans l'application</li>
                      <li>Email automatique à l'enseignant</li>
                      <li>Statut changé en "En attente PJ"</li>
                      <li>Retour possible à "À examiner" après ajout des PJ</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPendingModal(false);
                    setPendingComment('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="default"
                  onClick={confirmPending}
                  disabled={!pendingComment.trim() || pendingMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {pendingMutation.isPending ? 'Envoi en cours...' : 'Mettre en attente'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant SessionCard
interface SessionCardProps {
  session: Session;
  onTransmit: () => void;
  onReject: () => void;
  onPending: () => void;
  onViewDetails: () => void;
  getStatusBadge: (status: string) => JSX.Element;
  getTypeBadge: (type: string) => JSX.Element;
}

function SessionCard({ session, onTransmit, onReject, onPending, onViewDetails, getStatusBadge, getTypeBadge }: SessionCardProps) {
  const [attachmentCount, setAttachmentCount] = useState<number>(0);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  // Charger le nombre de pièces jointes
  React.useEffect(() => {
    const loadAttachmentCount = async () => {
      setIsLoadingAttachments(true);
      try {
        const response = await fetch(`/api/sessions/${session.id}/attachments`);
        if (response.ok) {
          const attachments = await response.json();
          setAttachmentCount(attachments.length);
        }
      } catch (error) {
        console.error('Erreur chargement pièces jointes:', error);
      } finally {
        setIsLoadingAttachments(false);
      }
    };

    loadAttachmentCount();
  }, [session.id]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Informations principales */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <span className="font-semibold text-lg">{session.teacherName}</span>
              {getStatusBadge(session.status)}
              {getTypeBadge(session.type)}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{session.timeSlot}</span>
              </div>
              {attachmentCount > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Paperclip className="h-4 w-4" />
                  <span>{attachmentCount} pièce(s) jointe(s)</span>
                </div>
              )}
            </div>

            {/* Détails spécifiques */}
            {session.type === 'RCD' && session.className && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Classe :</span> {session.className}
                {session.replacedTeacherLastName && (
                  <span className="ml-4">
                    <span className="font-medium">Remplace :</span> {session.replacedTeacherPrefix} {session.replacedTeacherLastName}
                  </span>
                )}
              </div>
            )}

            {session.type === 'DEVOIRS_FAITS' && (
              <div className="text-sm text-gray-600">
                {session.studentCount && (
                  <span><span className="font-medium">Élèves :</span> {session.studentCount}</span>
                )}
                {session.gradeLevel && (
                  <span className="ml-4"><span className="font-medium">Niveau :</span> {session.gradeLevel}</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Détails
            </Button>

            {session.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTransmit}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Transmettre
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPending}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Clock className="h-4 w-4" />
                  En attente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeter
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant SessionDetails
interface SessionDetailsProps {
  session: Session;
  attachments: Attachment[];
  onDownload: (attachment: Attachment, session: Session) => void;
  formatFileSize: (bytes: number) => string;
  getStatusBadge: (status: string) => JSX.Element;
  getTypeBadge: (type: string) => JSX.Element;
}

function SessionDetails({ session, attachments, onDownload, formatFileSize, getStatusBadge, getTypeBadge }: SessionDetailsProps) {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{session.teacherName}</h3>
          <p className="text-gray-600">
            {new Date(session.date).toLocaleDateString('fr-FR')} - {session.timeSlot}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(session.status)}
          {getTypeBadge(session.type)}
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Informations générales</h4>
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div><span className="font-medium">Type :</span> {session.type}</div>
            <div><span className="font-medium">Date :</span> {new Date(session.date).toLocaleDateString('fr-FR')}</div>
            <div><span className="font-medium">Créneau :</span> {session.timeSlot}</div>
            <div><span className="font-medium">Statut :</span> {session.status}</div>
          </div>
        </div>

        {session.type === 'RCD' && (
          <div className="space-y-2">
            <h4 className="font-medium">Détails du remplacement</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              {session.className && <div><span className="font-medium">Classe :</span> {session.className}</div>}
              {session.replacedTeacherLastName && (
                <div>
                  <span className="font-medium">Enseignant remplacé :</span> {session.replacedTeacherPrefix} {session.replacedTeacherLastName} {session.replacedTeacherFirstName}
                </div>
              )}
            </div>
          </div>
        )}

        {session.type === 'DEVOIRS_FAITS' && (
          <div className="space-y-2">
            <h4 className="font-medium">Détails des devoirs faits</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              {session.studentCount && <div><span className="font-medium">Nombre d'élèves :</span> {session.studentCount}</div>}
              {session.gradeLevel && <div><span className="font-medium">Niveau :</span> {session.gradeLevel}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {session.description && (
        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            {session.description}
          </div>
        </div>
      )}

      {/* Pièces jointes */}
      <div className="space-y-2">
        <h4 className="font-medium">Pièces jointes ({attachments.length})</h4>
        {attachments.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune pièce jointe</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{attachment.originalName}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  {attachment.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(attachment, session)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
