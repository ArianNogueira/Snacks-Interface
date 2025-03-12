'use client';

import { Aside } from "./Cart";
import { Section } from "./DishesSection";
import { Header } from "./Header";
import { Nav } from "./SideNavigation";

export function Main() {
    return (
        <>
            <Header />
            <div className="flex flex-nowrap justify-between">
                <Nav />
                <Section />
                <Aside />
            </div>
        </>
    )
}