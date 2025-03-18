"use client";

import { editarDish } from "@/store/reduceres/dishesSlice";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/reduceres/store';
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalClose {
    closeModal: () => void;
    dish?: Data;
}

interface Data {
    id: number,
    nome: string,
    preco: number,
    quantidade: number,
    categoria: string,
    imagem: string
}

export function EditModal({ closeModal, dish}: ModalClose) {
    const dispatch = useDispatch<AppDispatch>();
    const [dataDish, setDataDish] = useState<Data>(dish ?? {
        id: 0,
        nome: "",
        preco: 0,
        quantidade: 0,
        categoria: "",
        imagem: ""
    });

    const handleEditDish = () => {
        dispatch(editarDish(dataDish));
        toast.success("Prato editado com sucesso!")
        closeModal();
    }

    return (
        <div className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50" onClick={closeModal}>
            <div className="max-w-96 bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-center text-[20px] font-medium">Altere as informações do prato</h2>
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="text"
                    placeholder="Nome"
                    value={dataDish?.nome}
                    onChange={(e) => setDataDish({ ...dataDish, nome: e.target.value })}
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="number"
                    placeholder="R$ 0,00"
                    value={dataDish?.preco}
                    onChange={(e) => setDataDish({ ...dataDish, preco: Number(e.target.value) })}
                />
                <div className="flex justify-between ">
                    <button
                        className='bg-[#926e56] px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                        onClick={handleEditDish}
                    >
                        Salvar
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