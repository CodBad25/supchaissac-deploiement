import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SystemSettings } from "./SystemSettings";
import { UserImport } from "./UserImport";
import {
  Users,
  UploadCloud,
  Settings,
  InfoIcon,
  ChevronDown,
  ChevronUp,
  Menu
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserManagement } from "./UserManagement";

export function AdminTabs() {
  const [isNavVisible, setIsNavVisible] = useState(false);
  return (
    <Tabs defaultValue="users" className="w-full mt-4">
      {/* 🔽 Bouton discret pour afficher/masquer la navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsNavVisible(!isNavVisible)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4" />
          <span className="text-sm">Navigation</span>
          {isNavVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Indicateur de section active */}
        <div className="text-sm text-gray-500">
          Console Administrateur
        </div>
      </div>

      {/* 📋 Navigation collapsible */}
      {isNavVisible && (
        <div className="mb-6 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">Console Administrateur</AlertTitle>
            <AlertDescription>
              Cette interface est dédiée à la gestion des comptes utilisateurs et aux paramètres système.
              Pour le suivi et la validation des heures de remplacement, utilisez l'interface Direction.
            </AlertDescription>
          </Alert>

          <TabsList className="grid grid-cols-3 md:w-fit">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Utilisateurs</span>
            </TabsTrigger>

            <TabsTrigger value="import" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              <span className="hidden md:inline">Import PRONOTE</span>
            </TabsTrigger>

            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>
        </div>
      )}
      
      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="import">
        <UserImport />
      </TabsContent>
      
      <TabsContent value="settings">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  );
}