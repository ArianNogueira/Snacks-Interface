'use client'
import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, BellRing, ClipboardList, LoaderCircle, LogOut, MessageSquareText, UserPlus } from 'lucide-react';
import logo from '../../public/assets/Logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function Header() {
    const { user, profile, role, loading, signOut } = useAuth();
    const [onlineOrders, setOnlineOrders] = useState(0);
    const isStaff = role === "administrador" || role === "funcionario";

    const loadOnlineOrders = useCallback(async () => {
        if (!isStaff) {
            setOnlineOrders(0);
            return;
        }
        const { count, error } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("status", "recebido")
            .ilike("observacao", "PEDIDO ONLINE%");
        if (!error) setOnlineOrders(count ?? 0);
    }, [isStaff]);

    useEffect(() => {
        void loadOnlineOrders();
        if (!isStaff) return;
        const channel = supabase
            .channel("online-orders-reminder")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadOnlineOrders())
            .subscribe();
        return () => { void supabase.removeChannel(channel); };
    }, [isStaff, loadOnlineOrders]);

    return (
        <header className="hero-header relative h-64 w-full bg-zinc-900 bg-cover bg-center sm:h-80 lg:h-[420px]">
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
                    {isStaff && <Link href="/pedidos" aria-label={`${onlineOrders} pedido(s) online aguardando atendimento`} title="Pedidos online aguardando atendimento" className="relative inline-flex items-center justify-center rounded-full border border-white/30 bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/60"><BellRing size={19} className={onlineOrders > 0 ? "animate-pulse text-amber-300" : ""} />{onlineOrders > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow">{onlineOrders > 99 ? "99+" : onlineOrders}</span>}</Link>}
                    {isStaff && <Link href="/pedidos" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"><ClipboardList size={18} /><span className="hidden sm:inline">Pedidos</span></Link>}
                    {role === "administrador" && <Link href="/admin/avaliacoes" aria-label="Avaliações" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"><MessageSquareText size={18} /><span className="hidden xl:inline">Avaliações</span></Link>}
                    {role === "administrador" && <Link href="/admin/funcionarios" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"><UserPlus size={18} /><span className="hidden lg:inline">Funcionários</span></Link>}
                    {role === "administrador" && <Link href="/estatisticas" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"><BarChart3 size={18} /><span className="hidden sm:inline">Faturamento</span></Link>}
                    {loading ? (
                        <span className="rounded-full border border-white/30 bg-black/40 p-2 text-white"><LoaderCircle className="animate-spin" size={19} /></span>
                    ) : user ? (
                        <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60" title={`Conectado como ${profile?.nome || user.email} (${role ?? "sem perfil"})`}><LogOut size={18} /><span className="hidden sm:inline">Sair</span></button>
                    ) : (
                        <>
                            {/* Botão de login oculto temporariamente da tela principal.
                            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"><LogIn size={18} /><span className="hidden sm:inline">Entrar</span></Link>
                            */}
                        </>
                    )}
                </div>
                <div className="flex h-full w-full flex-col items-center justify-center bg-black/35 px-4 text-center">
                    <Image src={logo} alt="Logo da Lanchonete" priority className="h-24 w-24 rounded-full shadow-lg duration-200 hover:scale-105 sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                    <h1 className="mt-4 text-2xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">Cléo Nogueira Lanches</h1>
                </div>
            </header>
    );
}
