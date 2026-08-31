'use client';

import { Aside } from "./Cart";
import { Header } from "./Header";
import { Nav } from "./SideNavigation";
import { Section } from "./DishesSection";
import { useAuth } from "@/contexts/AuthContext";

export function Main() {
    const { loading } = useAuth();

    return (
        <>
            <Header />
            <main className={`mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:px-8 ${!loading ? "xl:grid-cols-[180px_minmax(0,1fr)_320px]" : "xl:grid-cols-[180px_minmax(0,1fr)]"}`}>
                <Nav />
                <Section/>
                {!loading && <Aside />}
            </main>
        </>
    )
}
