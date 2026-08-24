'use client'
import Image from 'next/image';
import logo from '../../public/assets/Logo.png';

export function Header() {
    return (
        <header className="hero-header h-64 w-full bg-zinc-900 bg-cover bg-center sm:h-80 lg:h-[420px]">
                <div className="flex h-full w-full flex-col items-center justify-center bg-black/35 px-4 text-center">
                    <Image src={logo} alt="Logo da Lanchonete" priority className="h-24 w-24 rounded-full shadow-lg duration-200 hover:scale-105 sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                    <h1 className="mt-4 text-2xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-4xl">Cléo Nogueira Lanches</h1>
                </div>
            </header>
    );
}
