import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Attachment } from "@shared/schema-pg";

export function useAttachments(sessionId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer les documents d'une session
  const { data: attachments = [], isLoading, error } = useQuery({
    queryKey: ["/api/sessions", sessionId, "attachments"],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${sessionId}/attachments`);
      return res.json();
    },
    enabled: !!sessionId,
  });

  // Upload d'un document
  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ sessionId, file }: { sessionId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`/api/sessions/${sessionId}/attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "attachments"] });
      toast({
        title: "Document ajouté",
        description: "Le document a été joint avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vérifier un document
  const verifyAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await apiRequest("PATCH", `/api/attachments/${attachmentId}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "attachments"] });
      toast({
        title: "Document vérifié",
        description: "Le document a été marqué comme vérifié",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Archiver un document
  const archiveAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await apiRequest("PATCH", `/api/attachments/${attachmentId}/archive`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "attachments"] });
      toast({
        title: "Document archivé",
        description: "Le document a été archivé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Supprimer un document
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await apiRequest("DELETE", `/api/attachments/${attachmentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "attachments"] });
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Télécharger un document
  const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = `/api/attachments/${attachment.id}/download`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Utilitaires
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('csv')) return '📋';
    return '📎';
  };

  return {
    attachments,
    isLoading,
    error,
    uploadAttachmentMutation,
    verifyAttachmentMutation,
    archiveAttachmentMutation,
    deleteAttachmentMutation,
    downloadAttachment,
    formatFileSize,
    getFileIcon,
  };
}
