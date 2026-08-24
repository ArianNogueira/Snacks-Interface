"use client";

import { editarDish } from "@/store/reduceres/dishesSlice";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/reduceres/store';
import { useState } from "react";
import { toast } from "react-toastify";
import { ImagesService } from "@/services/images";

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
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleEditDish = async () => {
        setSaving(true);
        try {
            const oldImage = dataDish.imagem;
            const imageUrl = imageFile ? await ImagesService.upload(imageFile) : oldImage;
            await dispatch(editarDish({ ...dataDish, imagem: imageUrl })).unwrap();
            if (imageFile) await ImagesService.removeByUrl(oldImage).catch(() => undefined);
            toast.success("Prato editado com sucesso!");
            closeModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível editar o prato.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={closeModal}>
            <div className="my-auto w-full max-w-96 rounded-lg bg-white p-4 shadow-lg sm:p-6" onClick={(e) => e.stopPropagation()}>
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
                <label className="block text-sm font-medium text-zinc-700">Substituir imagem (opcional)</label>
                <input
                    className="w-full p-2 my-3 rounded-md border border-gray-300"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap justify-between gap-3">
                    <button
                        className='bg-[#926e56] px-4 py-2 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                        onClick={handleEditDish}
                        disabled={saving}
                    >
                        {saving ? "Salvando..." : "Salvar"}
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
