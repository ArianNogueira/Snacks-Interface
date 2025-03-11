'use client';

import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/reduceres/store';
import { useEffect, useState } from 'react';
import { buscarDishes } from '@/store/reduceres/dishesSlice';
import { addCart } from '@/store/reduceres/cartSlice';
import { ModalDish } from './ModalDish';

import { ToastContainer, toast } from 'react-toastify';

import React from 'react';


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

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleOpenModal = () => {
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }
    return (
        <div>
            <ToastContainer />
            <div className='text-end'>
                <button
                    className='bg-[#926e56] p-4 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                    onClick={handleOpenModal}
                >
                    Adicionar
                </button>
            </div>

            {isModalOpen && (
                <ModalDish closeModal={handleCloseModal} />
            )}

            <ul key={1} className='grid items-center justify-between grid-cols-1 gap-10 px-5 md:grid-cols-2 lg:grid-cols-3'>
                {items && items.length > 0 ? (
                    items.map((dishe: Dish) => (
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
                            <div className="flex flex-col items-center w-full">
                                <button
                                    className="bg-[#926e56] hover:bg-[#d1c4ac] duration-300 px-5 py-1 rounde"
                                    onClick={() => dispatch(addCart({ id: dishe.id, nome: dishe.nome, quantidade: 1, preco: dishe.preco, precoUnitario: dishe.preco }))}
                                >
                                    Adicionar Item
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
