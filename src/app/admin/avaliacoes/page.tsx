"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { deleteReview, getReviews, Review } from "@/services/reviews";
import { ArrowLeft, MessageSquareText, RefreshCw, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function ReviewsDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try { setReviews(await getReviews()); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível carregar as avaliações."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const stats = useMemo(() => {
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((review) => review.rating === stars).length }));
    return { average, distribution };
  }, [reviews]);

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este comentário?")) return;
    setDeletingId(id);
    try { await deleteReview(id); setReviews((current) => current.filter((review) => review.id !== id)); toast.success("Avaliação excluída."); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível excluir."); } finally { setDeletingId(null); }
  }

  return <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#e4ede3] text-zinc-800">
    <header className="bg-[#382110] text-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div className="flex min-w-0 items-center gap-3"><Link href="/" aria-label="Voltar" className="shrink-0 rounded-full p-2 hover:bg-white/10"><ArrowLeft /></Link><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-[#d8c3b3]">Administração</p><h1 className="text-xl font-bold sm:text-2xl">Avaliações dos clientes</h1></div></div><button onClick={loadReviews} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Atualizar</button></div></header>
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <section className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-zinc-500">Média de estrelas</p><div className="mt-2 flex items-center gap-3"><strong className="text-4xl text-[#382110]">{stats.average.toFixed(1)}</strong><Star className="fill-amber-400 text-amber-400" size={30} /></div></article><article className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-zinc-500">Quantidade de avaliações</p><strong className="mt-2 block text-4xl text-[#382110]">{reviews.length}</strong></article></section>
      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold text-[#382110]">Distribuição das notas</h2><div className="mt-4 space-y-3">{stats.distribution.map(({ stars, count }) => <div key={stars} className="grid grid-cols-[42px_minmax(0,1fr)_32px] items-center gap-3 text-sm"><span className="flex items-center gap-1">{stars}<Star size={14} className="fill-amber-400 text-amber-400" /></span><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full bg-amber-400" style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }} /></div><span className="text-right text-zinc-500">{count}</span></div>)}</div></section>
      <section className="mt-5"><h2 className="flex items-center gap-2 text-xl font-bold text-[#382110]"><MessageSquareText size={22} /> Comentários por prato</h2>{loading ? <p className="mt-4 rounded-2xl bg-white p-6 text-zinc-500">Carregando...</p> : reviews.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-6 text-zinc-500">Nenhuma avaliação recebida.</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2">{reviews.map((review) => <article key={review.id} className="min-w-0 rounded-2xl bg-white p-5 shadow-sm"><p className="mb-3 break-words font-bold text-[#382110]">{review.dishName ?? "Prato não identificado"}</p><div className="flex items-start justify-between gap-3"><div className="flex gap-1" aria-label={`${review.rating} estrelas`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"} />)}</div><button onClick={() => handleDelete(review.id)} disabled={deletingId === review.id} aria-label="Excluir avaliação" className="shrink-0 rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={18} /></button></div><p className="mt-4 break-words text-sm leading-6 text-zinc-700">{review.comment}</p><time className="mt-4 block text-xs text-zinc-400">{dateFormatter.format(new Date(review.created_at))}</time></article>)}</div>}</section>
    </div>
  </main>;
}

export default function ReviewsPage() {
  return <RoleGuard allowedRoles={["administrador"]}><ReviewsDashboard /></RoleGuard>;
}
