import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch("/api/user", { headers });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`Erreur lors de la récupération des données: ${res.status}`);
        const data = await res.json();
        return data as User;
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error("Erreur inconnue");
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec de connexion");
      }
      return await res.json();
    },
    onSuccess: (response: any) => {
      // Stocker le token si présent
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      // Extraire les données utilisateur (sans le token)
      const { token, ...user } = response;

      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de connexion",
        description: error.message || "Identifiants invalides",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Échec d'inscription");
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec d'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Supprimer le token du localStorage
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé avec un AuthProvider");
  }
  return context;
}