"use client";

import { createReview, getReviews, Review } from "@/services/reviews";
import { MessageSquareText, RefreshCw, Send, Star, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "react-toastify";

export function CustomerReview({ dishId, dishName, canReview, onReviewSubmitted }: { dishId: number; dishName: string; canReview: boolean; onReviewSubmitted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews]);

  async function load() {
    setLoading(true);
    try { setReviews(await getReviews(dishId)); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível carregar as avaliações."); } finally { setLoading(false); }
  }

  function handleOpen() {
    setOpen(true);
    void load();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createReview(dishId, rating, comment);
      toast.success("Avaliação enviada. Obrigado!");
      setRating(0);
      setComment("");
      await load();
      onReviewSubmitted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <button type="button" onClick={handleOpen} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#926e56] bg-white px-4 py-2 text-[#382110] transition-colors hover:bg-[#f5f5f5]"><MessageSquareText size={18} /> Avaliações</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5" onClick={() => setOpen(false)}>
      <section className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-left text-zinc-800 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b p-5"><div className="min-w-0"><p className="text-sm font-semibold uppercase tracking-wider text-[#926e56]">Avaliações do prato</p><h2 className="mt-1 break-words text-2xl font-bold text-[#382110]">{dishName}</h2><div className="mt-2 flex flex-wrap items-center gap-2"><strong className="text-xl">{average.toFixed(1)}</strong><Star size={20} className="fill-amber-400 text-amber-400" /><span className="text-sm text-zinc-500">({reviews.length} avaliação{reviews.length === 1 ? "" : "ões"})</span></div></div><button type="button" aria-label="Fechar" onClick={() => setOpen(false)} className="shrink-0 rounded-full p-2 hover:bg-zinc-100"><X /></button></header>
        <div className="overflow-y-auto p-5">
          {canReview && <form onSubmit={handleSubmit} className="rounded-xl bg-[#f7f3ef] p-4">
            <fieldset><legend className="text-sm font-semibold text-zinc-700">Sua nota</legend><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} estrela${value > 1 ? "s" : ""}`} onClick={() => setRating(value)} className="rounded-lg p-1"><Star size={31} className={value <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"} /></button>)}</div></fieldset>
            <label className="mt-4 block"><span className="text-sm font-semibold text-zinc-700">Comentário</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} required rows={4} placeholder={`O que achou de ${dishName}?`} className="mt-2 w-full resize-none rounded-xl border border-zinc-300 p-3" /><span className="mt-1 block text-right text-xs text-zinc-500">{comment.length}/500</span></label>
            <p className="mt-1 text-xs text-zinc-500">Seu nome não será solicitado nem armazenado.</p>
            <button type="submit" disabled={submitting || rating === 0 || !comment.trim()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#765540] px-5 py-3 font-semibold text-white disabled:opacity-50"><Send size={18} />{submitting ? "Enviando..." : "Enviar avaliação"}</button>
          </form>}
          <div className={canReview ? "mt-6" : ""}><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-[#382110]">Comentários</h3><button type="button" onClick={() => void load()} aria-label="Atualizar comentários" className="rounded-lg p-2 hover:bg-zinc-100"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button></div>{loading ? <p className="mt-4 text-sm text-zinc-500">Carregando...</p> : reviews.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Este prato ainda não possui avaliações.</p> : <div className="mt-3 space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-xl border p-4"><div className="flex gap-1" aria-label={`${review.rating} estrelas`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"} />)}</div><p className="mt-2 break-words text-sm leading-6">{review.comment}</p></article>)}</div>}</div>
        </div>
      </section>
    </div>}
  </>;
}
