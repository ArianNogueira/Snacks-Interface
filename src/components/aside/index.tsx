import { AppDispatch, RootState } from "@/store/reduceres/store"
import { useDispatch, useSelector } from "react-redux"

export function Aside() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [] } = useSelector((state: RootState) => state.cart);

    return (
        <aside className="w-full md:w-80 md:ml-6 bg-[#f5f5f5] px-7 py-6 rounded-lg">
            <ul>
                {items && items.length > 0 ? (

                    <div>
                        <div className="mb-3">
                            <i className="fa fa-print" aria-hidden="true"></i>
                        </div>

                        {items.map((item: { id: number; nome: string; preco: number, quantidade: number }) => (
                            <li key={item.id} className="w-full">
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-lg font-bold">{item.nome}</p>
                                        <button>
                                            X
                                        </button>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <p className="flex gap-1">
                                            Quantidade:
                                            <button className="bg-[#926e56] min-w-7 px-2 rounded-sm">-</button>
                                            {item.quantidade}
                                            <button className="bg-[#926e56] min-w-7 px-2 rounded-sm">+</button>
                                        </p>
                                        <p>R$ {item.preco.toFixed(2)}</p>
                                    </div>
                                </div>
                                <hr className="border-[#926e56] border-x-1 mb-3"></hr>
                            </li>
                        ))}

                        <div className="flex justify-between mt-10">
                            <strong>TOTAL:</strong>
                            <span id="card-total">R$ 0,00</span>
                        </div>

                        <div>
                            <h3 className="text-xl text-[#382110] font-bold mb-2 mt-5">Pagamento</h3>
                            <form className="flex flex-col gap-y-3">
                                <label className="flex justify-between cursor-pointer">
                                    <p><i className="fa-solid fa-money-bill"></i> Dinheiro</p>
                                    <input type="radio" name="payment" value="Dinheiro" />
                                </label>
                                <label className="flex justify-between cursor-pointer">
                                    <p><i className="fa-brands fa-pix"></i> Pix </p>
                                    <input type="radio" name="payment" value="Pix" />
                                </label>
                                <label className="flex justify-between cursor-pointer">
                                    <p><i className="fa-solid fa-credit-card"></i> Débito </p>
                                    <input type="radio" name="payment" value="Débito" />
                                </label>
                                <label className="flex justify-between cursor-pointer">
                                    <p><i className="fa-solid fa-credit-card"></i> Crédito </p>
                                    <input type="radio" name="payment" value="Crédito" />
                                </label>
                            </form>
                        </div>
                    </div>
                ) : (
                    <p>Ainda não há nenhum pedido</p>
                )}
            </ul>
        </aside>
    )
}