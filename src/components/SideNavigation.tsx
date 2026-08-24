'use client';

export function Nav() {
    return (
        <nav aria-label="Categorias" className="sticky top-2 z-20 flex w-full overflow-x-auto rounded-lg bg-[#f5f5f5]/95 p-2 text-center shadow-sm backdrop-blur lg:top-5 lg:flex-col lg:p-4">
            <a href="#almoço/jantar" className="min-w-max flex-1 rounded-md px-4 py-3 transition-colors hover:bg-[#926e56] hover:text-white">Almoço/Jantar</a>
            <hr className="hidden border-[#926e56] lg:block" />
            <a href="#lanches" className="min-w-max flex-1 rounded-md px-4 py-3 transition-colors hover:bg-[#926e56] hover:text-white">Lanches</a>
            <hr className="hidden border-[#926e56] lg:block" />
            <a href="#bebidas" className="min-w-max flex-1 rounded-md px-4 py-3 transition-colors hover:bg-[#926e56] hover:text-white">Bebidas</a>
        </nav>
    );
}
