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

interface Dish {
    id: number;
    nome: string;
    categoria: string;
    descricao?: string;
    imagem: string;
    preco: number;
    quantidade: number;
}

function notify(tipo: boolean): React.ReactNode {
    return tipo === false
        ? toast.error("Erro ao carregar os pratos!")
        : toast.success("Pratos carregados com sucesso!")
}

export function Section() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [] } = useSelector((state: RootState) => state.dishes);

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
        <div> 
            <div className='text-end'>
                <button
                    className='bg-[#926e56] p-4 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                    onClick={handleOpenModal}
                >
                    Adicionar
                </button>
            </div>

            {modalOpen === "add" && <ModalDish closeModal={handleCloseModal} />}
            {modalOpen === "edit" && <EditModal closeModal={handleCloseModal} dish={selectedDish}/>}

            <ul key={1} className='grid items-center justify-between grid-cols-1 gap-10 px-5 md:grid-cols-2 lg:grid-cols-3'>
                {items && items.length > 0 ? (
                    items
                    .slice()
                    .sort((a, b) => orderItems.indexOf(a.categoria) - orderItems.indexOf(b.categoria))
                    .map((dishe: Dish) => (
                        <li key={dishe.id} id={dishe.categoria} className='w-full p-3 mt-8 bg-white rounded-md'>
                            <div className="flex flex-col items-center">
                                <Image
                                    src={dishe.imagem}
                                    alt="Logo do prato"
                                    width={160}
                                    height={128}
                                    className="w-40 h-32 duration-300 rounded-md hover:scale-110 hover:-rotate-2" />
                            </div>
                            <div className="flex flex-col my-5 gap-y-2">
                                <p className="text-lg font-bold">{dishe.nome}</p>
                                {/* <p>{dishe.descricao}</p> */}
                                <p>R$ {dishe.preco.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col gap-y-3 items-center text-white w-full">
                                <button
                                    className="bg-[#926e56] hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounded-full w-36"
                                    onClick={() => dispatch(addCart({ id: dishe.id, nome: dishe.nome, quantidade: 1, preco: dishe.preco, precoUnitario: dishe.preco }))}
                                >
                                    Adicionar Item
                                </button>
                                
                                <button
                                    className="bg-yellow-400 hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounded-full w-36"
                                    onClick={() => handleEditModal(dishe)}
                                    >
                                    Editar
                                </button>

                                <button
                                    className="bg-red-500 hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounded-full w-36"
                                    onClick={() => handleDeletarDish(dishe)}
                                    >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))
                    // notify(true)
                ) : (
                    <div>
                        {/* {notify(false)} */}
                        <p>Nenhum prato encontrado.</p>
                    </div>
                )}
            </ul>
        </div>
    )
}
