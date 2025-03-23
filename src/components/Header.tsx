'use client'
import Image from 'next/image';
import logo from '../assets/Logo.png';


export function Header() {
    return (
        <header className="w-full h-[420px] bg-zinc-900 bg-home bg-cover bg-center">
            <div className="flex flex-col items-center justify-center w-full h-full">
                <Image src={logo} alt="Logo da Lanchonete" className="w-32 h-32 duration-200 rounded-full shadow-lg cursor-pointer hover:scale-110" />
                <h1 className="mt-4 text-4xl font-bold text-white">Cléo Nogueira Lanches</h1>
            </div>
        </header>
    );
}