import Image from 'next/image';
import Churrasco from '../../assets/Churrasco.jpg';
import Caldo from '../../assets/Caldo.webp';

export function Section() {
    return (
        <>
            <div className='grid items-center justify-between grid-cols-1 gap-10 px-5 md:grid-cols-2 lg:grid-cols-3"' id="Almoço/Jantar">
                <section className="w-full p-3 mt-8 bg-white rounded-md">
                    <div className="flex flex-col items-center">
                        <Image src={Churrasco} alt="Logo Churrasco"
                            className="w-40 h-32 duration-300 rounded-md hover:scale-110 hover:-rotate-2" />
                    </div>
                    <div className="flex flex-col my-5 gap-y-2">
                        <p className="text-lg font-bold">Churrasco</p>
                        <form className="flex justify-between" id="select-barbecue">
                            <div className="flex flex-col ">
                                <label>
                                    <input type="radio" name="barbecue" value="Churrasco de Alcatra" /> Alcatra
                                </label>
                                <label>
                                    <input type="radio" name="barbecue" value="Churrasco de Picanha" /> Picanha
                                </label>
                                <label>
                                    <input type="radio" name="barbecue" value="Churrasco de Frango" /> Frango
                                </label>
                            </div>
                            <div className="flex flex-col">
                                <label>
                                    <input type="radio" name="barbecue" value="Churrasco Misto" /> Misto
                                </label>
                                <label>
                                    <input type="radio" name="barbecue" value="Churrasco de Leitão" /> Leitão
                                </label>
                            </div>
                        </form>
                        <p>R$ 20.00</p>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <button className="bg-[#926e56] hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounded adicionar-item"
                            data-name="Churrasco" data-price="20.00" data-caminho="../assets/Churrasco.jpg">
                            Adicionar Item
                        </button>
                    </div>
                </section>

                <section className="flex flex-col gap-y-6 w-full p-3 mt-8 bg-white rounded-md">
                    <div className="flex flex-col items-center">
                        <Image src={Caldo} alt="Logo Caldo"
                            className="w-40 h-32 duration-300 rounded-md hover:scale-110 hover:-rotate-2" />
                    </div>
                    <div className="flex flex-col my-5 gap-y-2">
                        <p className="text-lg font-bold">Caldo</p>
                        <p>Categoria</p>
                        <p>R$ 20.00</p>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <button className="bg-[#926e56] hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounded adicionar-item"
                            data-name="Caldo" data-price="20.00" data-caminho="../assets/Caldo.webp">
                            Adicionar Item
                        </button>
                    </div>
                </section>
            </div>
        </>
    )
}