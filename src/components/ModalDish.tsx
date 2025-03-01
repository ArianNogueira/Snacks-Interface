"use client"

import { useState } from "react"

interface Infos {
    nome: string,
    categoria: string,
    valor: Number,
    image: string
}

export function ModalDish() {
    // const [infoDIsh, setInfoDIsh] = useState([""]);

    return (
        <div>
            <h2>Preencha os dados para adicionar um nova prato</h2>
            <input
                required
                type="text"
                placeholder="Nome"
                // onChange={(e) => }
            />
            <input
                required
                type="text"
                placeholder="Categoria"
                // onChange={(e) => }
            />
            <input
                required
                type="number"
                placeholder="Valor"
                // onChange={(e) => }
            />
            <input
                required
                type="file"
                // onChange={(e) => }
            />

            <button
                className='bg-[#926e56] p-4 text-lg text-white rounded-full mt-5 hover:text-amber-950 duration-300 ease-in text'
                // onClick={() => dispatch(adiconarDishes())}
            >
                Adicionar
            </button>
        </div>
    )
}