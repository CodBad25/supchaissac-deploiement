import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Users, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  details: string[];
}

export function UserImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvPreview, setCsvPreview] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Prévisualiser le contenu du fichier
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').slice(0, 5); // Première 5 lignes
        setCsvPreview(lines.join('\n'));
      };
      reader.readAsText(selectedFile);
    }
  };

  // Importer les utilisateurs
  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/admin/import-users', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'import');
      }

      const importResult = await response.json();
      setResult(importResult);

      // 🔄 RAFRAÎCHIR LA LISTE DES UTILISATEURS
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      toast({
        title: "Import terminé",
        description: `${importResult.imported} utilisateurs importés avec succès. La liste des utilisateurs a été mise à jour.`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer le fichier CSV",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Import des Utilisateurs</h2>
      </div>

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Format CSV attendu :</strong> Nom, Prénom, Email, Matière, Statut_PACTE
          <br />
          <strong>Exemple :</strong> MARTIN,Sophie,sophie.martin@college.fr,Mathématiques,OUI
        </AlertDescription>
      </Alert>

      {/* Sélection de fichier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Sélectionner le fichier CSV
          </CardTitle>
          <CardDescription>
            Exportez la liste des enseignants depuis Pronote au format CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csvFile">Fichier CSV</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {/* Prévisualisation */}
          {csvPreview && (
            <div>
              <Label>Aperçu du fichier (5 premières lignes)</Label>
              <Textarea
                value={csvPreview}
                readOnly
                className="mt-1 font-mono text-sm"
                rows={5}
              />
            </div>
          )}

          {/* Bouton d'import */}
          <Button 
            onClick={handleImport} 
            disabled={!file || importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer les utilisateurs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Barre de progression */}
      {importing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import en cours...</span>
                <span>Veuillez patienter</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'import */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Résultats de l'import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-green-700">Importés</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-yellow-700">Ignorés</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                <div className="text-sm text-red-700">Erreurs</div>
              </div>
            </div>

            {result.details.length > 0 && (
              <div>
                <Label>Détails de l'import</Label>
                <Textarea
                  value={result.details.join('\n')}
                  readOnly
                  className="mt-1 font-mono text-sm"
                  rows={Math.min(result.details.length, 10)}
                />
              </div>
            )}

            {result.imported > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mot de passe par défaut :</strong> SupChaissac2025!
                  <br />
                  Les utilisateurs doivent changer leur mot de passe à la première connexion.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guide d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle>Guide d'utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Export depuis Pronote :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Aller dans "Ressources" → "Professeurs"</li>
              <li>Sélectionner tous les enseignants</li>
              <li>Exporter au format CSV avec les colonnes : Nom, Prénom, Email, Matière</li>
            </ul>
          </div>
          <div>
            <strong>2. Ajouter la colonne PACTE :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Ouvrir le fichier CSV dans Excel</li>
              <li>Ajouter une colonne "Statut_PACTE"</li>
              <li>Remplir avec "OUI" ou "NON" pour chaque enseignant</li>
            </ul>
          </div>
          <div>
            <strong>3. Import dans SupChaissac :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Sélectionner le fichier CSV modifié</li>
              <li>Vérifier l'aperçu</li>
              <li>Cliquer sur "Importer les utilisateurs"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
