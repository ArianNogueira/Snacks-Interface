'use client';

import { Aside } from "./Cart";
import { Header } from "./Header";
import { Nav } from "./SideNavigation";
import { Section } from "./DishesSection";

export function Main() {
    return (
        <>
            <Header />
            <div className="flex flex-nowrap justify-between">
                <Nav />
                <Section/>
                <Aside />
            </div>
        </>
    )
}