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
    em_promocao: boolean,
    preco_promocional: number | null,
    quantidade: number,
    categoria: string,
    imagem: string,
    availableToday: boolean,
    averageRating: number,
    reviewCount: number
}

export function EditModal({ closeModal, dish}: ModalClose) {
    const dispatch = useDispatch<AppDispatch>();
    const [dataDish, setDataDish] = useState<Data>(dish ?? {
        id: 0,
        nome: "",
        preco: 0,
        em_promocao: false,
        preco_promocional: null,
        quantidade: 0,
        categoria: "",
        imagem: "",
        availableToday: true,
        averageRating: 0,
        reviewCount: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleEditDish = async () => {
        if (!dataDish.nome.trim() || dataDish.preco <= 0) {
            toast.error("Informe um nome e um valor normal maior que zero.");
            return;
        }
        if (dataDish.em_promocao && (!dataDish.preco_promocional || dataDish.preco_promocional >= dataDish.preco)) {
            toast.error("O valor promocional deve ser maior que zero e menor que o valor normal.");
            return;
        }
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
                <label className="my-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <input type="checkbox" checked={dataDish.em_promocao} onChange={(e) => setDataDish({ ...dataDish, em_promocao: e.target.checked, preco_promocional: e.target.checked ? dataDish.preco_promocional : null })} />
                    Prato em promoção
                </label>
                {dataDish.em_promocao && <input
                    className="my-3 w-full rounded-md border border-gray-300 p-2 placeholder:text-zinc-500"
                    required min="0.01" step="0.01" type="number" placeholder="Valor promocional"
                    value={dataDish.preco_promocional ?? ""}
                    onChange={(e) => setDataDish({ ...dataDish, preco_promocional: e.target.value === "" ? null : Number(e.target.value) })}
                />}
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
