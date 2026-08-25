"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function getLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Confirme-o no Supabase e tente novamente.";
  }

  if (message.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos. Confira se o usuário foi criado neste mesmo projeto do Supabase.";
  }

  if (message.includes("too many requests") || message.includes("rate limit")) {
    return "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.";
  }

  if (message.includes("fetch")) {
    return "Não foi possível conectar ao Supabase. Verifique a internet e as variáveis do arquivo .env.";
  }

  return error instanceof Error
    ? `Não foi possível entrar: ${error.message}`
    : "Não foi possível entrar. Tente novamente.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-[#765540]" size={34} aria-label="Carregando" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#765540] hover:underline">
          <ArrowLeft size={17} /> Voltar ao cardápio
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#926e56]">Acesso ao sistema</p>
          <h1 className="mt-2 text-3xl font-bold text-[#382110]">Entrar</h1>
          <p className="mt-2 text-sm text-zinc-600">Use o e-mail e a senha cadastrados no sistema.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-700">E-mail</span>
            <span className="flex items-center gap-3 rounded-xl border border-zinc-300 px-4 focus-within:border-[#926e56] focus-within:ring-2 focus-within:ring-[#926e56]/20">
              <Mail size={19} className="shrink-0 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="min-w-0 flex-1 bg-transparent py-3"
                placeholder="seu@email.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-700">Senha</span>
            <span className="flex items-center gap-3 rounded-xl border border-zinc-300 px-4 focus-within:border-[#926e56] focus-within:ring-2 focus-within:ring-[#926e56]/20">
              <LockKeyhole size={19} className="shrink-0 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                minLength={6}
                className="min-w-0 flex-1 bg-transparent py-3"
                placeholder="Sua senha"
              />
            </span>
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#765540] px-5 py-3 font-semibold text-white transition hover:bg-[#5f422f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={19} className="animate-spin" />}
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
