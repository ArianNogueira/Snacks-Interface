"use client"

import { useState } from "react"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/reduceres/store';
import { adicionarDish } from "@/store/reduceres/dishesSlice";

import { toast } from 'react-toastify';

interface Infos {
    nome: string,
    categoria: string,
    preco: number,
    imagem: string,
    id: 16,
    quantidade: 1
}

interface ModalClose {
    closeModal: () => void;
}

export function ModalDish({ closeModal }: ModalClose) {
    const dispatch = useDispatch<AppDispatch>();
    const [infoDish, setInfoDish] = useState({} as Infos);

    const handleAddDish = () => {
        if(!infoDish.nome || !infoDish.categoria || !infoDish.preco || !infoDish.imagem) {
            toast.error("Preencha todos os campos!")
            return;
        }
        dispatch(adicionarDish(infoDish));
        toast.success("Prato adicionado com sucesso!")
        closeModal();
    }

    return (
        <div className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50" onClick={closeModal}>
            <div className="max-w-96 bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-center text-[20px] font-medium">Preencha os dados para adicionar um novo prato</h2>
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="text"
                    placeholder="Nome"
                    onChange={(e) => setInfoDish({ ...infoDish, nome: e.target.value})}
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="text"
                    placeholder="Categoria"
                    onChange={(e) => setInfoDish({ ...infoDish, categoria: e.target.value.toLocaleLowerCase()})}
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="number"
                    placeholder="R$ 0,00"
                    onChange={(e) => setInfoDish({ ...infoDish, preco: Number(e.target.value)})}
                />
                <input
                    className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500 border border-gray-300"
                    required
                    type="file"
                    onChange={
                        (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const fileURL = URL.createObjectURL(file);
                                setInfoDish({ ...infoDish, imagem: fileURL});
                            }
                        }
                    }
                />
                <div className="flex justify-between ">
                    <button
                        className='bg-[#926e56] px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                        onClick={handleAddDish}
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
