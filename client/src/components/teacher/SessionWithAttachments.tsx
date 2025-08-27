import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, BookOpen } from "lucide-react";
import { AttachmentUpload } from "./AttachmentUpload";
import type { Session } from "@shared/schema-pg";

interface SessionWithAttachmentsProps {
  session: Session;
}

export function SessionWithAttachments({ session }: SessionWithAttachmentsProps) {
  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'RCD': return 'Remplacement de Courte Durée';
      case 'DEVOIRS_FAITS': return 'Devoirs Faits';
      case 'HSE': return 'Heures Supplémentaires Effectives';
      case 'AUTRE': return 'Autre';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'En attente de vérification';
      case 'PENDING_VALIDATION': return 'En attente de validation';
      case 'VALIDATED': return 'Validée';
      case 'REJECTED': return 'Rejetée';
      case 'PAID': return 'Payée';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'outline';
      case 'PENDING_VALIDATION': return 'secondary';
      case 'VALIDATED': return 'default';
      case 'REJECTED': return 'destructive';
      case 'PAID': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations de la session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Détails de la session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Créneau:</span>
              <span>{session.timeSlot}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Enseignant:</span>
              <span>{session.teacherName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Statut:</span>
              <Badge variant={getStatusVariant(session.status)}>
                {getStatusLabel(session.status)}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="font-medium">Type:</span>
            <Badge variant="outline" className="ml-2">
              {getSessionTypeLabel(session.type)}
            </Badge>
          </div>

          {/* Détails spécifiques selon le type */}
          {session.type === 'RCD' && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Détails du remplacement</h4>
              {session.replacedTeacherName && (
                <p><span className="font-medium">Enseignant remplacé:</span> {session.replacedTeacherName}</p>
              )}
              {session.className && (
                <p><span className="font-medium">Classe:</span> {session.className}</p>
              )}
              {session.subject && (
                <p><span className="font-medium">Matière:</span> {session.subject}</p>
              )}
            </div>
          )}

          {session.type === 'DEVOIRS_FAITS' && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Détails des devoirs faits</h4>
              {session.studentCount && (
                <p><span className="font-medium">Nombre d'élèves:</span> {session.studentCount}</p>
              )}
              {session.gradeLevel && (
                <p><span className="font-medium">Niveau:</span> {session.gradeLevel}</p>
              )}
            </div>
          )}

          {session.description && (
            <div className="space-y-2">
              <span className="font-medium">Description:</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{session.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestion des documents joints */}
      <AttachmentUpload 
        sessionId={session.id} 
        disabled={session.status === 'VALIDATED' || session.status === 'PAID'}
      />
    </div>
  );
}
