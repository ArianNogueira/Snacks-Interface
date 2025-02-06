export function Aside() {
    return (
        <aside className="w-full md:w-80 md:ml-6 bg-[#f5f5f5] px-7 py-6 rounded-lg">
            <div id="mensagem-extrato">
                <p>Ainda não há nenhum pedido</p>
            </div>
            <div id="extrato-pedido_div" className="hidden">
                <div className="mb-3">
                    <i className="fa fa-print" aria-hidden="true"></i>
                </div>
                <div id="extrato-ticket">
                </div>
                <div className="flex justify-between mt-10">
                    <strong>TOTAL:</strong>
                    <span id="card-total">R$ 0,00</span>
                </div>
                <div>
                    <h3 className="text-xl text-[#382110] font-bold mb-2 mt-5">Pagamento</h3>
                    <form className="flex flex-col gap-y-3">
                        <label className="flex justify-between cursor-pointer">
                            <p><i className="fa-solid fa-money-bill"></i> Dinheiro</p>
                            <input type="radio" name="payment" value="Dinheiro"/>
                        </label>
                        <label className="flex justify-between cursor-pointer">
                            <p><i className="fa-brands fa-pix"></i> Pix </p>
                            <input type="radio" name="payment" value="Pix"/>
                        </label>
                        <label className="flex justify-between cursor-pointer">
                            <p><i className="fa-solid fa-credit-card"></i> Débito </p>
                            <input type="radio" name="payment" value="Débito"/>
                        </label>
                        <label className="flex justify-between cursor-pointer">
                            <p><i className="fa-solid fa-credit-card"></i> Crédito </p>
                            <input type="radio" name="payment" value="Crédito"/>
                        </label>
                    </form>
                </div>
            </div>
        </aside>
    )
}