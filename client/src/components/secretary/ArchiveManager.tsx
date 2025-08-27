import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Archive, 
  Download, 
  FolderOpen, 
  Calendar,
  User,
  FileText,
  Package
} from "lucide-react";

interface Session {
  id: number;
  teacherName: string;
  type: string;
  date: string;
  timeSlot: string;
  status: string;
}

interface ArchiveManagerProps {
  sessions: Session[];
}

export function ArchiveManager({ sessions }: ArchiveManagerProps) {
  const { toast } = useToast();
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [archiveNote, setArchiveNote] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  // Filtrer les sessions validées avec pièces jointes
  const validatedSessions = sessions.filter(s => 
    s.status === 'VALIDATED' || s.status === 'READY_FOR_PAYMENT'
  );

  // Archiver les sessions sélectionnées
  const archiveSelectedSessions = async () => {
    if (selectedSessions.length === 0) {
      toast({
        title: "Aucune session sélectionnée",
        description: "Veuillez sélectionner au moins une session à archiver",
        variant: "destructive"
      });
      return;
    }

    setIsArchiving(true);
    
    try {
      // Créer un dossier d'archive avec la date
      const archiveDate = new Date().toISOString().split('T')[0];
      const archiveName = `Archive_${archiveDate}_${selectedSessions.length}_sessions`;
      
      let totalFiles = 0;
      let successCount = 0;
      
      for (const sessionId of selectedSessions) {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) continue;
        
        try {
          // Récupérer les pièces jointes de la session
          const attachmentsResponse = await fetch(`/api/sessions/${sessionId}/attachments`);
          if (!attachmentsResponse.ok) continue;
          
          const attachments = await attachmentsResponse.json();
          totalFiles += attachments.length;
          
          // Télécharger chaque pièce jointe avec un nom intelligent
          for (const attachment of attachments) {
            try {
              const response = await fetch(`/api/attachments/${attachment.id}/download`);
              if (!response.ok) continue;
              
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              
              // Nom de fichier intelligent
              const date = session.date.replace(/-/g, '');
              const teacherName = session.teacherName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
              const sessionType = session.type;
              const timeSlot = session.timeSlot;
              const originalName = attachment.originalName;
              
              a.download = `${archiveName}/${date}_${teacherName}_${sessionType}_${timeSlot}_${originalName}`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              // Marquer la pièce jointe comme archivée
              await apiRequest("PATCH", `/api/attachments/${attachment.id}/archive`, {
                note: archiveNote
              });
              
              successCount++;
              
              // Petit délai pour éviter de surcharger le navigateur
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error('Erreur lors du téléchargement:', error);
            }
          }
          
        } catch (error) {
          console.error('Erreur lors du traitement de la session:', error);
        }
      }
      
      // Créer un fichier de métadonnées pour l'archive
      const metadata = {
        archiveName,
        createdAt: new Date().toISOString(),
        sessionsCount: selectedSessions.length,
        filesCount: totalFiles,
        successCount,
        note: archiveNote,
        sessions: selectedSessions.map(id => {
          const session = sessions.find(s => s.id === id);
          return {
            id: session?.id,
            teacherName: session?.teacherName,
            type: session?.type,
            date: session?.date,
            timeSlot: session?.timeSlot
          };
        })
      };
      
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const metadataUrl = window.URL.createObjectURL(metadataBlob);
      const metadataLink = document.createElement('a');
      metadataLink.href = metadataUrl;
      metadataLink.download = `${archiveName}/METADATA.json`;
      document.body.appendChild(metadataLink);
      metadataLink.click();
      window.URL.revokeObjectURL(metadataUrl);
      document.body.removeChild(metadataLink);
      
      toast({
        title: "Archivage terminé",
        description: `${successCount}/${totalFiles} fichiers archivés avec succès dans ${archiveName}`,
      });
      
      setSelectedSessions([]);
      setArchiveNote('');
      
    } catch (error) {
      toast({
        title: "Erreur d'archivage",
        description: "Une erreur est survenue lors de l'archivage",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Sélectionner/désélectionner une session
  const toggleSessionSelection = (sessionId: number) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Sélectionner toutes les sessions
  const selectAllSessions = () => {
    setSelectedSessions(validatedSessions.map(s => s.id));
  };

  // Désélectionner toutes les sessions
  const deselectAllSessions = () => {
    setSelectedSessions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Gestionnaire d'archives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validatedSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune session validée à archiver</p>
          </div>
        ) : (
          <>
            {/* Actions de sélection */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={selectAllSessions}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllSessions}>
                Tout désélectionner
              </Button>
              <Badge variant="secondary">
                {selectedSessions.length} session(s) sélectionnée(s)
              </Badge>
            </div>

            {/* Liste des sessions */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validatedSessions.map((session) => (
                <div 
                  key={session.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSessions.includes(session.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSessionSelection(session.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => toggleSessionSelection(session.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{session.teacherName}</span>
                      <Badge variant="outline">{session.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(session.date).toLocaleDateString('fr-FR')} - {session.timeSlot}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note d'archivage */}
            <div className="space-y-2">
              <Label htmlFor="archive-note">Note d'archivage (optionnelle)</Label>
              <Textarea
                id="archive-note"
                placeholder="Ajoutez une note pour cette archive..."
                value={archiveNote}
                onChange={(e) => setArchiveNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Bouton d'archivage */}
            <Button
              onClick={archiveSelectedSessions}
              disabled={selectedSessions.length === 0 || isArchiving}
              className="w-full"
            >
              {isArchiving ? (
                <>
                  <Archive className="h-4 w-4 mr-2 animate-spin" />
                  Archivage en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Archiver et télécharger ({selectedSessions.length} session(s))
                </>
              )}
            </Button>

            {/* Informations */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>💡 Fonctionnement :</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Les fichiers seront téléchargés avec des noms intelligents</li>
                <li>Format : Date_Enseignant_Type_Créneau_NomOriginal</li>
                <li>Un fichier METADATA.json sera inclus avec les détails</li>
                <li>Les pièces jointes seront marquées comme archivées</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
