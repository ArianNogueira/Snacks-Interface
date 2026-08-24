"use client"

import { useState } from "react"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/reduceres/store';
import { adicionarDish } from "@/store/reduceres/dishesSlice";
import { ImagesService } from "@/services/images";

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

const almoco_jantar = ["almoco", "almoço", "janta", "jantr"];
const lanhces = ["lanche", "lanch", "lache"];
const bebidas = ["bebida", "bebids", "bebdas"]

export function ModalDish({ closeModal }: ModalClose) {
    const dispatch = useDispatch<AppDispatch>();
    const [infoDish, setInfoDish] = useState({} as Infos);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageFile(file ?? null);
    };

    const handleAddDish = async () => {
        if(!infoDish.nome || !infoDish.categoria || !infoDish.preco || !imageFile) {
            toast.error("Preencha todos os campos!")
            return;
        }

        if(almoco_jantar.includes(infoDish.categoria)) {
            infoDish.categoria = "almoço/jantar"
        } else if (lanhces.includes(infoDish.categoria)) {
            infoDish.categoria = "lanches"
        } else if (bebidas.includes(infoDish.categoria)) {
            infoDish.categoria = "bebidas"
        } else {
            toast.error("Opção de caterogia incorreta!");
            return
        }

        setSaving(true);
        try {
            const imageUrl = await ImagesService.upload(imageFile);
            await dispatch(adicionarDish({ ...infoDish, imagem: imageUrl })).unwrap();
            toast.success("Prato adicionado com sucesso!");
            closeModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível adicionar o prato.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={closeModal}>
            <div className="my-auto w-full max-w-96 rounded-lg bg-white p-4 shadow-lg sm:p-6" onClick={(e) => e.stopPropagation()}>
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
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload} 
                />
                {/* <input
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
                /> */}
                <div className="flex flex-wrap justify-between gap-3">
                    <button
                        className='bg-[#926e56] px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                        onClick={handleAddDish}
                        disabled={saving}
                    >
                        {saving ? "Salvando..." : "Adicionar"}
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
