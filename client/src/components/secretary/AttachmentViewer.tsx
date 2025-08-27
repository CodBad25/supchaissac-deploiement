import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  Eye, 
  Archive, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  File
} from "lucide-react";

interface Attachment {
  id: number;
  sessionId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: number;
  isVerified: boolean;
  verifiedBy?: number;
  verifiedAt?: string;
  isArchived: boolean;
  archivedBy?: number;
  archivedAt?: string;
  createdAt: string;
}

interface AttachmentViewerProps {
  sessionId: number;
  sessionInfo: {
    teacherName: string;
    type: string;
    date: string;
    timeSlot: string;
  };
}

export function AttachmentViewer({ sessionId, sessionInfo }: AttachmentViewerProps) {
  const { toast } = useToast();

  // Récupérer les pièces jointes de la session
  const { 
    data: attachments = [], 
    isLoading,
    refetch 
  } = useQuery<Attachment[]>({
    queryKey: [`/api/sessions/${sessionId}/attachments`],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/attachments`);
      if (!response.ok) throw new Error('Erreur lors du chargement des pièces jointes');
      return response.json();
    }
  });

  // Mutation pour vérifier une pièce jointe
  const verifyMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const response = await apiRequest("PATCH", `/api/attachments/${attachmentId}/verify`, {});
      if (!response.ok) throw new Error('Erreur lors de la vérification');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Pièce jointe vérifiée",
        description: "La pièce jointe a été marquée comme vérifiée",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation pour archiver une pièce jointe
  const archiveMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const response = await apiRequest("PATCH", `/api/attachments/${attachmentId}/archive`, {});
      if (!response.ok) throw new Error('Erreur lors de l\'archivage');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Pièce jointe archivée",
        description: "La pièce jointe a été archivée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Télécharger une pièce jointe
  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/download`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nom intelligent pour la sauvegarde
      const date = sessionInfo.date.replace(/-/g, '');
      const teacherName = sessionInfo.teacherName.replace(/\s+/g, '_');
      const sessionType = sessionInfo.type;
      const timeSlot = sessionInfo.timeSlot;
      const extension = attachment.originalName.split('.').pop();
      
      a.download = `${date}_${teacherName}_${sessionType}_${timeSlot}_${attachment.originalName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Téléchargement réussi",
        description: `Fichier sauvegardé : ${a.download}`,
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  // Icône selon le type de fichier
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    if (mimeType.includes('image')) return <ImageIcon className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Formatage de la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pièces jointes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Chargement des pièces jointes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Pièces jointes ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucune pièce jointe pour cette session
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(attachment.mimeType)}
                  <div>
                    <div className="font-medium">{attachment.originalName}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {attachment.isVerified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        À vérifier
                      </Badge>
                    )}
                    {attachment.isArchived && (
                      <Badge variant="outline">
                        <Archive className="h-3 w-3 mr-1" />
                        Archivé
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  
                  {!attachment.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyMutation.mutate(attachment.id)}
                      disabled={verifyMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Vérifier
                    </Button>
                  )}
                  
                  {!attachment.isArchived && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveMutation.mutate(attachment.id)}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archiver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
