import { Banknote, CreditCard } from 'lucide-react';

interface FormProps {
    pixEnabled?: boolean;
    metodoPagamento: string;
    setMetodoPagamento: (metodo: string) => void;
}

export function Form({ metodoPagamento, setMetodoPagamento, pixEnabled = false }: FormProps) {
    return (
        <form className="flex flex-col gap-y-2">
            <label className="flex justify-between cursor-pointer">
                <Banknote />
                <p>Dinheiro</p>
                <input
                required
                    type="radio"
                    name="payment"
                    value="Dinheiro"
                    checked={metodoPagamento === 'Dinheiro'}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                />
            </label>
            <label className="flex justify-between cursor-pointer">
                <CreditCard />
                <p>Débito </p>
                <input
                required
                    type="radio"
                    name="payment"
                    value="Débito"
                    checked={metodoPagamento === 'Débito'}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                />
            </label>
            <label className="flex justify-between cursor-pointer">
                <CreditCard />
                <p>Crédito </p>
                <input
                required
                    type="radio"
                    name="payment"
                    value="Crédito"
                    checked={metodoPagamento === 'Crédito'}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                />
            </label>
            {pixEnabled && <label className="flex justify-between cursor-pointer"><Banknote /><p>Pix</p><input type="radio" name="payment" value="Pix PagBank" checked={metodoPagamento === "Pix PagBank"} onChange={(e) => setMetodoPagamento(e.target.value)} /></label>}
        </form>
    )
}
