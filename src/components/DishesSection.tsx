'use client';

import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/reduceres/store';
import { useEffect, useState } from 'react';
import { buscarDishes, definirDisponibilidade, deletarDish } from '@/store/reduceres/dishesSlice';
import { addCart } from '@/store/reduceres/cartSlice';
import { ModalDish } from './ModalDish';

import { toast } from 'react-toastify';

import React from 'react';
import { EditModal } from './editModal';
import { OrderHistory } from './OrderHistory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CircleCheck, CircleX, LoaderCircle, Star } from 'lucide-react';
import { CustomerReview } from './CustomerReview';

interface Dish {
    id: number;
    nome: string;
    categoria: string;
    descricao?: string;
    imagem: string;
    preco: number;
    em_promocao: boolean;
    preco_promocional: number | null;
    quantidade: number;
    availableToday: boolean;
    averageRating: number;
    reviewCount: number;
}

export function Section() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [], loading, error } = useSelector((state: RootState) => state.dishes);
    const { role, loading: authLoading } = useAuth();
    const isAdmin = !authLoading && role === "administrador";
    const canManageMenu = !authLoading && (role === "administrador" || role === "funcionario");
    const canManageOrders = !authLoading && (role === "administrador" || role === "funcionario");

    useEffect(() => {
        dispatch(buscarDishes());
    }, [dispatch]);

    useEffect(() => {
        const channel = supabase
            .channel('dish-availability-today')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dish_availability' }, () => {
                void dispatch(buscarDishes());
            })
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    }, [dispatch]);

    const [modalOpen, setModalOpen] = useState<"add" | "edit" | false>(false);
    const [selectedDish, setSelectedDish] = useState<Dish>();
    const [updatingAvailability, setUpdatingAvailability] = useState<number | null>(null);

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

    const handleAvailability = async (dish: Dish) => {
        setUpdatingAvailability(dish.id);
        try {
            await dispatch(definirDisponibilidade({ dishId: dish.id, available: !dish.availableToday })).unwrap();
            toast.success(dish.availableToday ? "Prato marcado como indisponível hoje." : "Prato disponível novamente hoje.");
        } catch (availabilityError) {
            toast.error(availabilityError instanceof Error ? availabilityError.message : "Não foi possível alterar a disponibilidade.");
        } finally {
            setUpdatingAvailability(null);
        }
    }

    const orderItems = ["almoço/jantar", "lanches", "bebidas"];

    return (
        <section className="min-w-0">
            <div className='flex flex-wrap justify-end gap-3'>
                {canManageOrders && <OrderHistory />}
                {canManageMenu && <button
                    className='rounded-full bg-[#926e56] px-6 py-3 text-base text-white shadow-sm duration-300 hover:bg-[#765540] focus-visible:ring-2 focus-visible:ring-[#926e56] focus-visible:ring-offset-2 sm:text-lg'
                    onClick={handleOpenModal}
                >
                    Adicionar
                </button>}
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
                            <div className="relative flex flex-col items-center">
                                <Image
                                    src={dishe.imagem}
                                    alt="Logo do prato"
                                    width={160}
                                    height={128}
                                    className={`h-40 w-full rounded-md object-cover duration-300 sm:h-44 ${dishe.availableToday ? "hover:scale-[1.03]" : "opacity-50 grayscale"}`} />
                                {!dishe.availableToday && <span className="absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/85 px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">Indisponível hoje</span>}
                                {dishe.em_promocao && dishe.preco_promocional !== null && <span className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">Promoção</span>}
                            </div>
                            <div className="flex flex-col my-5 gap-y-2">
                                <p className="text-lg font-bold">{dishe.nome}</p>
                                {/* <p>{dishe.descricao}</p> */}
                                {dishe.em_promocao && dishe.preco_promocional !== null ? <div className="flex flex-wrap items-baseline gap-2">
                                    <span className="text-sm text-zinc-500 line-through">R$ {dishe.preco.toFixed(2)}</span>
                                    <strong className="text-xl text-red-600">R$ {dishe.preco_promocional.toFixed(2)}</strong>
                                </div> : <p>R$ {dishe.preco.toFixed(2)}</p>}
                                {dishe.reviewCount > 0 && <div className="flex items-center gap-1.5 text-sm text-zinc-600"><Star size={17} className="fill-amber-400 text-amber-400" /><strong className="text-zinc-800">{dishe.averageRating.toFixed(1)}</strong><span>({dishe.reviewCount} avaliação{dishe.reviewCount === 1 ? "" : "ões"})</span></div>}
                            </div>
                            <div className="mt-auto grid w-full grid-cols-2 gap-2 text-center text-sm text-white sm:text-base">
                                <CustomerReview dishId={dishe.id} dishName={dishe.nome} canReview={!authLoading && !canManageMenu} onReviewSubmitted={() => { void dispatch(buscarDishes()); }} />
                                {dishe.availableToday && <button
                                    className="col-span-2 rounded-full bg-[#926e56] px-4 py-2 duration-300 hover:bg-[#765540]"
                                    onClick={() => {
                                        const price = dishe.em_promocao && dishe.preco_promocional !== null ? dishe.preco_promocional : dishe.preco;
                                        dispatch(addCart({ id: dishe.id, nome: dishe.nome, quantidade: 1, preco: price, precoUnitario: price }));
                                    }}
                                >
                                    Adicionar ao pedido
                                </button>}

                                {canManageMenu && <button
                                    type="button"
                                    disabled={updatingAvailability === dishe.id}
                                    className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 duration-300 disabled:cursor-wait disabled:opacity-60 ${dishe.availableToday ? "bg-zinc-700 hover:bg-zinc-800" : "bg-emerald-600 hover:bg-emerald-700"}`}
                                    onClick={() => handleAvailability(dishe)}
                                >
                                    {updatingAvailability === dishe.id ? <LoaderCircle className="animate-spin" size={18} /> : dishe.availableToday ? <CircleX size={18} /> : <CircleCheck size={18} />}
                                    {dishe.availableToday ? "Marcar indisponível hoje" : "Disponibilizar hoje"}
                                </button>}
                                
                                {canManageMenu && <button
                                    className={`${isAdmin ? "" : "col-span-2"} rounded-full bg-yellow-500 px-4 py-2 duration-300 hover:bg-yellow-600`}
                                    onClick={() => handleEditModal(dishe)}
                                    >
                                    Editar
                                </button>}

                                {isAdmin && <button
                                    className="rounded-full bg-red-500 px-4 py-2 duration-300 hover:bg-red-600"
                                    onClick={() => handleDeletarDish(dishe)}
                                    >
                                    Excluir
                                </button>}
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
