'use client';

export function Nav() {
    return (
        <nav className="relative md:sticky top-auto md:top-5 bg-[#f5f5f5] p-6 rounded-lg w-full md:w-[180px] max-h-60 text-center mr-0 md:mr-6 mb-6">
            <a href="#Almoço/Jantar" className="block p-4">Almoço/Jantar</a>
            <hr className="border-[#926e56] border-x-1" />
            <a href="#Lanches" className="block p-4">Lanches</a>
            <hr className="border-[#926e56] border-x-1" />
            <a href="#Bebidas" className="block p-4">Bebidas</a>
            <hr className="border-[#926e56] border-x-1" />
        </nav>
    );
}