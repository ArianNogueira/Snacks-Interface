'use client'
import Image from 'next/image';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import logo from '../../public/assets/Logo.png';

export function Header() {
    return (
        <header className="hero-header relative h-64 w-full bg-zinc-900 bg-cover bg-center sm:h-80 lg:h-[420px]">
                <Link href="/estatisticas" className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60 sm:right-6 sm:top-6"><BarChart3 size={18} /><span className="hidden sm:inline">Faturamento</span></Link>
                <div className="flex h-full w-full flex-col items-center justify-center bg-black/35 px-4 text-center">
                    <Image src={logo} alt="Logo da Lanchonete" priority className="h-24 w-24 rounded-full shadow-lg duration-200 hover:scale-105 sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                    <h1 className="mt-4 text-2xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">Cléo Nogueira Lanches</h1>
                </div>
            </header>
    );
}
