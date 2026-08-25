"use client";

import { useAuth, UserRole } from "@/contexts/AuthContext";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const allowed = role !== null && allowedRoles.includes(role);

  useEffect(() => {
    if (loading || allowed) return;
    router.replace(user ? "/" : "/login");
  }, [allowed, loading, router, user]);

  if (loading || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-[#765540]" size={34} aria-label="Verificando permissão" />
      </main>
    );
  }

  return children;
}
