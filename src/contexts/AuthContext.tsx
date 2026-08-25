"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UserRole = "administrador" | "funcionario" | "cliente";

export interface Profile {
  id: string;
  nome: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, role, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      setProfile(null);
      throw new Error(`Erro ao carregar o perfil: ${error.message}`);
    }

    setProfile(data as Profile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await loadProfile(user.id);
  }, [loadProfile, user]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;
      if (error) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          await loadProfile(currentUser.id);
        } catch {
          // O consumidor recebe profile=null e pode impedir áreas restritas.
        }
      }

      if (active) setLoading(false);
    }

    void initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(true);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      void loadProfile(currentUser.id)
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
