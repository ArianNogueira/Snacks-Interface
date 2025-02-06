import { Aside } from "../aside";
import { Header } from "../header";
import { Nav } from "../nav/indes";
import { Section } from "../section";

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