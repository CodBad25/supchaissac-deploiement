import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 🔧 DEV TOOL - Interface pour les utilisateurs du switcher
interface SwitcherUser {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  userCredentials: string; // JSON string
  isDemoUser: boolean;
  isActive: boolean;
  description: string | null;
}

// Fallback - utilisateurs par défaut si la base est vide
const FALLBACK_USERS = [
  {
    id: 1,
    userId: 1,
    userName: "Sophie Martin",
    userRole: "TEACHER",
    userCredentials: JSON.stringify({
      username: "teacher1@example.com",
      password: "password123"
    }),
    isDemoUser: true,
    isActive: true,
    description: "Enseignante sans pacte"
  },
  {
    id: 2,
    userId: 2,
    userName: "Laure Martin",
    userRole: "SECRETARY",
    userCredentials: JSON.stringify({
      username: "secretary@example.com",
      password: "password123"
    }),
    isDemoUser: true,
    isActive: true,
    description: "Secrétariat"
  },
  {
    id: 3,
    userId: 3,
    userName: "Jean Dupont",
    userRole: "PRINCIPAL",
    userCredentials: JSON.stringify({
      username: "principal@example.com",
      password: "password123"
    }),
    isDemoUser: true,
    isActive: true,
    description: "Direction"
  },
  {
    id: 4,
    userId: 4,
    userName: "Admin",
    userRole: "ADMIN",
    userCredentials: JSON.stringify({
      username: "admin@example.com",
      password: "password123"
    }),
    isDemoUser: true,
    isActive: true,
    description: "Administrateur système"
  }
];

export default function UserRoleSwitcher() {
  const [open, setOpen] = useState(false);
  const { user, logoutMutation, loginMutation } = useAuth();
  const { toast } = useToast();
  const [switcherUsers, setSwitcherUsers] = useState<SwitcherUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  // Charger la liste des utilisateurs depuis l'API
  useEffect(() => {
    const loadSwitcherUsers = async () => {
      try {
        const response = await fetch('/api/user-switcher');
        if (response.ok) {
          const users = await response.json();
          // Si la liste est vide, utiliser le fallback
          if (users.length === 0) {
            console.log('🔧 Liste vide, utilisation du fallback');
            setSwitcherUsers(FALLBACK_USERS);
          } else {
            setSwitcherUsers(users);
          }
        } else {
          console.error('Erreur lors du chargement des utilisateurs switcher, utilisation du fallback');
          setSwitcherUsers(FALLBACK_USERS);
        }
      } catch (error) {
        console.error('Erreur réseau, utilisation du fallback:', error);
        setSwitcherUsers(FALLBACK_USERS);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadSwitcherUsers();
  }, []);

  // Fonction pour changer d'utilisateur
  const handleUserSwitch = async (switcherUser: SwitcherUser) => {
    try {
      setIsSwitching(true);
      setOpen(false);

      const credentials = JSON.parse(switcherUser.userCredentials);

      // Déconnexion de l'utilisateur actuel
      await logoutMutation.mutateAsync();

      // Connexion avec le nouvel utilisateur
      loginMutation.mutate(credentials, {
        onSuccess: () => {
          setIsSwitching(false);
        },
        onError: () => {
          setIsSwitching(false);
        }
      });

    } catch (error) {
      console.error('Erreur lors du changement d\'utilisateur:', error);
      setIsSwitching(false);
      toast({
        title: "Erreur",
        description: "Impossible de changer d'utilisateur",
        variant: "destructive",
      });
    }
  };

  // Fonction pour reset la liste (admin uniquement)
  const handleResetList = async () => {
    try {
      const response = await fetch('/api/user-switcher/reset', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recharger la liste
        const updatedResponse = await fetch('/api/user-switcher');
        if (updatedResponse.ok) {
          const users = await updatedResponse.json();
          setSwitcherUsers(users);
          toast({
            title: "Liste reset",
            description: "Seuls les 4 utilisateurs de base restent",
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de reset la liste",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du reset:', error);
    }
  };

  if (!user) return null;

  // Trouver l'utilisateur actuel dans la liste
  const currentUser = switcherUsers.find(
    (switcherUser) => {
      try {
        const credentials = JSON.parse(switcherUser.userCredentials);
        return credentials.username === user.username;
      } catch {
        return false;
      }
    }
  );

  // Séparer les utilisateurs par catégorie
  const teacherUsers = switcherUsers.filter(u => u.userRole === "TEACHER");
  const adminUsers = switcherUsers.filter(u => u.userRole !== "TEACHER");

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-3 h-9">
            <UserCircle2 className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">
              {currentUser?.userName || user.name}
            </span>
            <span className="ml-1 text-xs text-gray-500 hidden md:inline">
              ({currentUser?.description || user.role})
            </span>
            {loadingUsers && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Changer d'utilisateur</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loadingUsers ? (
          <DropdownMenuItem disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Chargement...
          </DropdownMenuItem>
        ) : (
          <>
            {/* Enseignants */}
            {teacherUsers.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Enseignants</DropdownMenuLabel>
                {teacherUsers.map((switcherUser) => {
                  const credentials = JSON.parse(switcherUser.userCredentials);
                  const isCurrentUser = credentials.username === user.username;

                  return (
                    <DropdownMenuItem
                      key={switcherUser.id}
                      className={`cursor-pointer ${isCurrentUser ? 'bg-blue-50' : ''}`}
                      onClick={() => handleUserSwitch(switcherUser)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{switcherUser.userName}</span>
                        <span className="text-xs text-gray-500">
                          {switcherUser.description}
                          {switcherUser.isDemoUser ? ' (test)' : ' (réel)'}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Administration */}
            {adminUsers.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Administration</DropdownMenuLabel>
                {adminUsers.map((switcherUser) => {
                  const credentials = JSON.parse(switcherUser.userCredentials);
                  const isCurrentUser = credentials.username === user.username;

                  return (
                    <DropdownMenuItem
                      key={switcherUser.id}
                      className={`cursor-pointer ${isCurrentUser ? 'bg-blue-50' : ''}`}
                      onClick={() => handleUserSwitch(switcherUser)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{switcherUser.userName}</span>
                        <span className="text-xs text-gray-500">
                          {switcherUser.description}
                          {switcherUser.isDemoUser ? ' (test)' : ' (réel)'}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            {/* Option reset pour admin */}
            {user.role === 'ADMIN' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-orange-600"
                  onClick={handleResetList}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset liste (garder que les 4 de base)
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Overlay de changement d'utilisateur */}
    {isSwitching && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Changement d'utilisateur</h3>
            <p className="text-sm text-gray-500 mt-1">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}