'use client';

import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/reduceres/store';
import { useEffect, useState } from 'react';
import { buscarDishes, deletarDish } from '@/store/reduceres/dishesSlice';
import { addCart } from '@/store/reduceres/cartSlice';
import { ModalDish } from './ModalDish';

import { toast } from 'react-toastify';

import React from 'react';
import { EditModal } from './editModal';
import { OrderHistory } from './OrderHistory';

interface Dish {
    id: number;
    nome: string;
    categoria: string;
    descricao?: string;
    imagem: string;
    preco: number;
    quantidade: number;
}

export function Section() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [], loading, error } = useSelector((state: RootState) => state.dishes);

    useEffect(() => {
        dispatch(buscarDishes());
    }, [dispatch]);

    const [modalOpen, setModalOpen] = useState<"add" | "edit" | false>(false);
    const [selectedDish, setSelectedDish] = useState<Dish>();

    const handleOpenModal = () => setModalOpen("add");
    const handleEditModal = (dish: Dish) => {
        setModalOpen('edit')
        setSelectedDish(dish)
    }
    const handleCloseModal = () => setModalOpen(false);

    const handleDeletarDish = async (dish: Dish) => {
        await dispatch(deletarDish(dish))
        toast.success("Prato deletado com sucesso!")
        dispatch(buscarDishes());
    }

    const orderItems = ["almoço/jantar", "lanches", "bebidas"];

    return (
        <section className="min-w-0">
            <div className='flex flex-wrap justify-end gap-3'>
                <OrderHistory />
                <button
                    className='rounded-full bg-[#926e56] px-6 py-3 text-base text-white shadow-sm duration-300 hover:bg-[#765540] focus-visible:ring-2 focus-visible:ring-[#926e56] focus-visible:ring-offset-2 sm:text-lg'
                    onClick={handleOpenModal}
                >
                    Adicionar
                </button>
            </div>

            {modalOpen === "add" && <ModalDish closeModal={handleCloseModal} />}
            {modalOpen === "edit" && <EditModal closeModal={handleCloseModal} dish={selectedDish}/>}

            <ul className='grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 2xl:grid-cols-3'>
                {loading ? (
                    <li className="col-span-full rounded-lg bg-white p-6 text-center">Carregando pratos...</li>
                ) : error ? (
                    <li className="col-span-full rounded-lg border border-red-300 bg-red-50 p-6 text-center text-red-700">
                        <p className="font-bold">Erro ao consultar o Supabase</p>
                        <p className="mt-2 text-sm">{error}</p>
                        <button type="button" onClick={() => dispatch(buscarDishes())} className="mt-4 rounded-full bg-red-700 px-5 py-2 text-white">
                            Tentar novamente
                        </button>
                    </li>
                ) : items.length > 0 ? (
                    items
                    .slice()
                    .sort((a, b) => orderItems.indexOf(a.categoria) - orderItems.indexOf(b.categoria))
                    .map((dishe: Dish) => (
                        <li key={dishe.id} id={dishe.categoria} className='flex min-w-0 scroll-mt-24 flex-col rounded-lg bg-white p-4 shadow-sm'>
                            <div className="flex flex-col items-center">
                                <Image
                                    src={dishe.imagem}
                                    alt="Logo do prato"
                                    width={160}
                                    height={128}
                                    className="h-40 w-full rounded-md object-cover duration-300 hover:scale-[1.03] sm:h-44" />
                            </div>
                            <div className="flex flex-col my-5 gap-y-2">
                                <p className="text-lg font-bold">{dishe.nome}</p>
                                {/* <p>{dishe.descricao}</p> */}
                                <p>R$ {dishe.preco.toFixed(2)}</p>
                            </div>
                            <div className="mt-auto grid w-full grid-cols-2 gap-2 text-center text-sm text-white sm:text-base">
                                <button
                                    className="col-span-2 rounded-full bg-[#926e56] px-4 py-2 duration-300 hover:bg-[#765540]"
                                    onClick={() => dispatch(addCart({ id: dishe.id, nome: dishe.nome, quantidade: 1, preco: dishe.preco, precoUnitario: dishe.preco }))}
                                >
                                    Adicionar Item
                                </button>
                                
                                <button
                                    className="rounded-full bg-yellow-500 px-4 py-2 duration-300 hover:bg-yellow-600"
                                    onClick={() => handleEditModal(dishe)}
                                    >
                                    Editar
                                </button>

                                <button
                                    className="rounded-full bg-red-500 px-4 py-2 duration-300 hover:bg-red-600"
                                    onClick={() => handleDeletarDish(dishe)}
                                    >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))
                    // notify(true)
                ) : (
                    <li className="col-span-full rounded-lg bg-white p-6 text-center">
                        <p>Nenhum prato encontrado.</p>
                    </li>
                )}
            </ul>
        </section>
    )
}
