"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { createEmployee } from "@/services/employees";
import { ArrowLeft, LoaderCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

function EmployeeForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createEmployee({ nome: nome.trim(), email: email.trim(), password });
      setSuccess("Funcionário criado com sucesso. Ele já pode entrar com o acesso informado.");
      setNome("");
      setEmail("");
      setPassword("");
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : "Não foi possível criar o funcionário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#765540] hover:underline">
          <ArrowLeft size={17} /> Voltar ao cardápio
        </Link>
        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#926e56]/15 text-[#765540]"><UserPlus /></div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#926e56]">Administração</p>
          <h1 className="mt-2 text-3xl font-bold text-[#382110]">Criar acesso de funcionário</h1>
          <p className="mt-2 text-sm text-zinc-600">O funcionário poderá entrar imediatamente com o e-mail e a senha definidos aqui.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-700">Nome</span><input value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full rounded-xl border border-zinc-300 px-4 py-3 focus:border-[#926e56] focus:ring-2 focus:ring-[#926e56]/20" placeholder="Nome do funcionário" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-700">E-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" className="w-full rounded-xl border border-zinc-300 px-4 py-3 focus:border-[#926e56] focus:ring-2 focus:ring-[#926e56]/20" placeholder="funcionario@email.com" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-700">Senha temporária</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-zinc-300 px-4 py-3 focus:border-[#926e56] focus:ring-2 focus:ring-[#926e56]/20" placeholder="Mínimo de 6 caracteres" /></label>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#765540] px-5 py-3 font-semibold text-white transition hover:bg-[#5f422f] disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <LoaderCircle size={19} className="animate-spin" /> : <UserPlus size={19} />}
            {submitting ? "Criando acesso..." : "Criar funcionário"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function EmployeesPage() {
  return <RoleGuard allowedRoles={["administrador"]}><EmployeeForm /></RoleGuard>;
}
