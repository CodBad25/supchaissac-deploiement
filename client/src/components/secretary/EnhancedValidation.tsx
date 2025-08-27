import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";
import { AttachmentViewer } from "./AttachmentViewer";
import { 
  Eye, 
  Check, 
  X, 
  Send,
  FileText,
  Paperclip,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  CheckSquare
} from 'lucide-react';
import type { Session } from "@shared/schema-pg";

export function EnhancedValidation() {
  const { sessions, updateSessionStatus } = useSession();
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [bulkComment, setBulkComment] = useState('');
  const { toast } = useToast();

  // Filtrer les sessions
  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesSearch = session.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.date.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Gérer la sélection multiple
  const handleSelectSession = (sessionId: number, checked: boolean) => {
    if (checked) {
      setSelectedSessions(prev => [...prev, sessionId]);
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(filteredSessions.map(s => s.id));
    } else {
      setSelectedSessions([]);
    }
  };

  // Actions individuelles
  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const handleTransferToValidation = async (sessionId: number, comment?: string) => {
    try {
      await updateSessionStatus(sessionId, 'PENDING_VALIDATION', comment);
      toast({
        title: "Succès",
        description: "Session transférée pour validation",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du transfert",
        variant: "destructive",
      });
    }
  };

  const handleRejectSession = async (sessionId: number, comment: string) => {
    try {
      await updateSessionStatus(sessionId, 'REJECTED', comment);
      toast({
        title: "Succès",
        description: "Session rejetée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du rejet",
        variant: "destructive",
      });
    }
  };

  // Actions en lot
  const handleBulkTransfer = async () => {
    try {
      await Promise.all(
        selectedSessions.map(id => 
          updateSessionStatus(id, 'PENDING_VALIDATION', bulkComment)
        )
      );
      toast({
        title: "Succès",
        description: `${selectedSessions.length} sessions transférées pour validation`,
      });
      setSelectedSessions([]);
      setBulkComment('');
      setShowBulkAction(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du transfert en lot",
        variant: "destructive",
      });
    }
  };

  // Fonctions utilitaires pour les badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">À réviser</Badge>;
      case 'PENDING_VALIDATION':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">En validation</Badge>;
      case 'VALIDATED':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Validée</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejetée</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Payée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'RCD':
        return <Badge className="bg-purple-100 text-purple-800">RCD</Badge>;
      case 'DEVOIRS_FAITS':
        return <Badge className="bg-blue-100 text-blue-800">Devoirs Faits</Badge>;
      case 'HSE':
        return <Badge className="bg-green-100 text-green-800">HSE</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Autre</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres et actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Enseignant, date, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Filtrer par statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING_REVIEW">À réviser</SelectItem>
                  <SelectItem value="PENDING_VALIDATION">En validation</SelectItem>
                  <SelectItem value="VALIDATED">Validées</SelectItem>
                  <SelectItem value="REJECTED">Rejetées</SelectItem>
                  <SelectItem value="PAID">Payées</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedSessions.length > 0 && (
              <Button 
                onClick={() => setShowBulkAction(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Transférer ({selectedSessions.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sessions à traiter ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Créneau</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedSessions.includes(session.id)}
                        onCheckedChange={(checked) => handleSelectSession(session.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                          {session.teacherName.split(' ').map(n => n[0]).join('')}
                        </div>
                        {session.teacherName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(session.date).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {session.timeSlot}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(session.type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* TODO: Voir documents */}}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSession(session)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {session.status === 'PENDING_REVIEW' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransferToValidation(session.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* TODO: Rejeter */}}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Aucune session ne correspond aux critères</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue pour les actions en lot */}
      <Dialog open={showBulkAction} onOpenChange={setShowBulkAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transférer les sessions sélectionnées</DialogTitle>
            <DialogDescription>
              {selectedSessions.length} session(s) sélectionnée(s) seront transférées pour validation par le principal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-comment">Commentaire (optionnel)</Label>
              <Textarea
                id="bulk-comment"
                placeholder="Ajouter un commentaire pour le principal..."
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAction(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkTransfer}>
              <Send className="h-4 w-4 mr-2" />
              Transférer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale de détail de session */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détail de la session</DialogTitle>
            <DialogDescription>
              {selectedSession?.teacherName} - {selectedSession?.date}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              {/* Informations de la session */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Enseignant</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedSession.teacherName}</div>
                </div>
                <div className="space-y-2">
                  <Label>Date et créneau</Label>
                  <div className="p-2 bg-gray-50 rounded">
                    {new Date(selectedSession.date).toLocaleDateString('fr-FR')} - {selectedSession.timeSlot}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type d'activité</Label>
                  <div className="p-2 bg-gray-50 rounded">{getTypeBadge(selectedSession.type)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Statut actuel</Label>
                  <div className="p-2 bg-gray-50 rounded">{getStatusBadge(selectedSession.status)}</div>
                </div>
              </div>

              {/* Description */}
              {selectedSession.description && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedSession.description}
                  </div>
                </div>
              )}

              {/* Documents joints */}
              <div className="space-y-2">
                <AttachmentViewer
                  sessionId={selectedSession.id}
                  sessionInfo={{
                    teacherName: selectedSession.teacherName,
                    type: selectedSession.type,
                    date: selectedSession.date,
                    timeSlot: selectedSession.timeSlot
                  }}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            {selectedSession?.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedSession) {
                      handleTransferToValidation(selectedSession.id);
                      setShowDetailModal(false);
                    }
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Transférer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedSession) {
                      handleRejectSession(selectedSession.id, "Session rejetée par la secrétaire");
                      setShowDetailModal(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
