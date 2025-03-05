"use client"

import { adiconarDishes } from "@/store/reduceres/dishesSlice"
import { useState } from "react"

interface Infos {
    nome: string,
    categoria: string,
    valor: Number,
    image: string
}

interface ModalClose {
    closeModal: () => void;
}

export function ModalDish({ closeModal }: ModalClose) {
    // const [infoDIsh, setInfoDIsh] = useState([""]);

    return (
        <div className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50" onClick={closeModal}>
            <div className="max-w-96 bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-center text-[20px] font-medium">Preencha os dados para adicionar um novo prato</h2>
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="text"
                    placeholder="Nome"
                    // onChange={(e) => }
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="text"
                    placeholder="Categoria"
                    // onChange={(e) => }
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="number"
                    placeholder="R$"
                    // onChange={(e) => }
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="file"
                    // onChange={(e) => }
                />
                <div className="flex justify-between ">
                    <button
                        className='bg-[#926e56] px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                        // onClick={() => dispatch(adiconarDishes())}
                    >
                        Adicionar
                    </button>
                    <button
                        className="bg-red-800 px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text"
                        onClick={closeModal}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}
