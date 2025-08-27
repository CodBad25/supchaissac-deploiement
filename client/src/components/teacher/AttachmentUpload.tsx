import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, FileText, X, Download } from "lucide-react";
import { useAttachments } from "@/hooks/use-attachments";

interface AttachmentUploadProps {
  sessionId: number;
  disabled?: boolean;
}

export function AttachmentUpload({ sessionId, disabled = false }: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const {
    attachments,
    isLoading,
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    downloadAttachment,
    formatFileSize,
    getFileIcon,
  } = useAttachments(sessionId);

  const handleFileSelect = (file: File) => {
    if (disabled) return;
    uploadAttachmentMutation.mutate({ sessionId, file });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents joints
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone d'upload */}
        {!disabled && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p>Glissez vos documents ici ou</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAttachmentMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Parcourir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploadAttachmentMutation.isPending}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Formats acceptés: PDF, Excel, CSV, Images (max 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Inputs cachés */}
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

        {/* Liste des documents */}
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">
            Chargement des documents...
          </div>
        ) : attachments.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              Documents joints ({attachments.length})
            </h4>
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFileIcon(attachment.mimeType)}</span>
                  <div>
                    <p className="font-medium text-sm">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                      {attachment.isVerified && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Vérifié
                        </Badge>
                      )}
                      {attachment.isArchived && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Archivé
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!disabled && !attachment.isArchived && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                      disabled={deleteAttachmentMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Aucun document joint
          </div>
        )}
      </CardContent>
    </Card>
  );
}
