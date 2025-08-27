import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Archive, 
  AlertCircle,
  Calendar,
  User
} from "lucide-react";
import { useAttachments } from "@/hooks/use-attachments";
import type { Attachment } from "@shared/schema-pg";

interface AttachmentManagerProps {
  sessionId: number;
  sessionDate: string;
  teacherName: string;
  sessionType: string;
}

export function AttachmentManager({ 
  sessionId, 
  sessionDate, 
  teacherName, 
  sessionType 
}: AttachmentManagerProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const {
    attachments,
    isLoading,
    verifyAttachmentMutation,
    archiveAttachmentMutation,
    downloadAttachment,
    formatFileSize,
    getFileIcon,
  } = useAttachments(sessionId);

  const handleViewAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setIsViewerOpen(true);
  };

  const handleVerifyAttachment = (attachmentId: number) => {
    verifyAttachmentMutation.mutate(attachmentId);
  };

  const handleArchiveAttachment = (attachmentId: number) => {
    archiveAttachmentMutation.mutate(attachmentId);
  };

  const getStatusBadge = (attachment: Attachment) => {
    if (attachment.isArchived) {
      return <Badge variant="secondary">Archivé</Badge>;
    }
    if (attachment.isVerified) {
      return <Badge variant="default">Vérifié</Badge>;
    }
    return <Badge variant="outline">En attente</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Chargement des documents...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents joints ({attachments.length})
        </CardTitle>
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {sessionDate}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {teacherName}
            </span>
            <Badge variant="outline">{sessionType}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun document joint à cette session</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(attachment.mimeType)}</span>
                  <div>
                    <p className="font-medium">{attachment.originalName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(attachment.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(attachment)}
                  
                  <div className="flex gap-1">
                    {/* Bouton Visualiser */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAttachment(attachment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Aperçu du document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <span className="text-2xl">{getFileIcon(attachment.mimeType)}</span>
                            <div>
                              <p className="font-medium">{attachment.originalName}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                              </p>
                            </div>
                          </div>
                          
                          {attachment.mimeType.includes('image') ? (
                            <div className="text-center">
                              <img 
                                src={`/api/attachments/${attachment.id}/download`}
                                alt={attachment.originalName}
                                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                              />
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-gray-500 mb-4">
                                Aperçu non disponible pour ce type de fichier
                              </p>
                              <Button onClick={() => downloadAttachment(attachment)}>
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger pour visualiser
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Bouton Télécharger */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {/* Bouton Vérifier */}
                    {!attachment.isVerified && !attachment.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerifyAttachment(attachment.id)}
                        disabled={verifyAttachmentMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Bouton Archiver */}
                    {attachment.isVerified && !attachment.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveAttachment(attachment.id)}
                        disabled={archiveAttachmentMutation.isPending}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Zone d'upload pour enseignants */}
        {!disabled && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachmentMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadAttachmentMutation.isPending}
              >
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileInputChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
            />
          </div>
        )}

        {/* Indicateur de statut global */}
        {attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              {attachments.every(a => a.isArchived) ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Tous les documents sont archivés</span>
                </>
              ) : attachments.every(a => a.isVerified) ? (
                <>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600">Tous les documents sont vérifiés</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-600">
                    {attachments.filter(a => !a.isVerified).length} document(s) en attente de vérification
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
