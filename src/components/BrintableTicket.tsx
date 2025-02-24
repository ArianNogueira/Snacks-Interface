interface Dish {
    id: number;
    nome: string;
    preco: number;
    precoUnitario: number;
    quantidade: number;
}

export function BrintableTicket(items: Dish[], metodoPagamento: String, total: Number) {
    const gerador = Math.floor(Math.random() * 100);

    const formatarData = () => {
        const data = new Date();
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0"); // Janeiro é 0
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, "0");
        const minutos = String(data.getMinutes()).padStart(2, "0");
        const segundos = String(data.getSeconds()).padStart(2, "0");

        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    };

    const dataFormatada = formatarData();

    return (
        <div style={{ padding: "-8px", margin: "-8px" }}>
            <span>=========================================================</span>
            <h1 style={{ fontSize: "25px", textAlign: "center" }}>Cléo Nogueira Lanches</h1>
            <span>=========================================================</span>
            <div style={{ padding: "0 8px" }}>
                <p><strong>PEDIDO: N° {gerador}</strong></p>
                <p>{dataFormatada}</p>
                <p>Cliente: Fulano de tal</p>
            </div>
            <span>=========================================================</span>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                <p>QTDE.</p>
                <p>PRATO</p>
                <p>PREÇO</p>
            </div>
            <span>=========================================================</span>
            {items.map(item =>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                    <p style={{ padding: "0 10px" }}>{item.quantidade}</p>
                    <p style={{ padding: "0 10px" }}>{item.nome}</p>
                    <p>R$ {item.preco.toFixed(2)}</p>
                </div>
            )}
            <span>=========================================================</span>
            <div style={{ padding: "0 8px" }}>
                <p style={{ textAlign: "right" }}>TOTAL: R$ {total.toFixed(2)}</p>
                <p><strong>Método de Pagamento:</strong> {metodoPagamento}</p>
            </div>
            <span>=========================================================</span>
            <div style={{ padding: "0 8px" }}>
                <p>Atendente: Taia</p>
                <p>OBS.:</p>
            </div>
            <div style={{ textAlign: "center" }}>
                <span>................................................................</span>
                <span>................................................................</span>
                <p>OBRIGADO, VOLTE SEMPRE! :)</p>
            </div>
        </div>
    )
}