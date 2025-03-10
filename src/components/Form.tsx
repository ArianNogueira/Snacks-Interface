import { Banknote, CreditCard, QrCode } from 'lucide-react';

interface FormProps {
    metodoPagamento: string;
    setMetodoPagamento: (metodo: string) => void;
}

export function Form({ metodoPagamento, setMetodoPagamento }: FormProps) {
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
                    onChange={(e) => setMetodoPagamento(e.target.value.toLowerCase())}
                />
            </label>
            <label className="flex justify-between cursor-pointer">
                <QrCode />
                <p>Pix </p>
                <input
                required
                    type="radio"
                    name="payment"
                    value="Pix"
                    checked={metodoPagamento === 'Pix'}
                    onChange={(e) => setMetodoPagamento(e.target.value.toLowerCase())}
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
                    onChange={(e) => setMetodoPagamento(e.target.value.toLowerCase())}
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
                    onChange={(e) => setMetodoPagamento(e.target.value.toLowerCase())}
                />
            </label>
        </form>
    )
}