interface Dish {
    id: number;
    nome: string;
    preco: number;
    precoUnitario: number;
    quantidade: number;
}

export function BrintableTicket(items: Dish[], metodoPagamento: String, total: Number, nome: string, observacao: string) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toDateString(); // Data sem horas

    // Obtém a última data salva
    const lastDate = localStorage.getItem("lastDate") || "";

    // Definição dos períodos de funcionamento
    const periods = [
        { start: { h: 9, m: 30 }, end: { h: 14, m: 0 } },
        { start: { h: 18, m: 0 }, end: { h: 22, m: 30 } }
    ];

    // Verifica se está dentro de algum dos períodos definidos
    const operation = periods.some(({ start, end }) =>
        (hours > start.h || (hours === start.h && minutes >= start.m)) &&
        (hours < end.h || (hours === end.h && minutes <= end.m))
    );

    // Se for um novo dia ou se estiver dentro do horário permitido, zera o contador
    if (lastDate !== today || !operation) {
        localStorage.setItem("qtd", "0");
        localStorage.setItem("lastDate", today);
    }

    // Atualiza o número do pedido
    let orderNumber = (Number(localStorage.getItem("qtd")) || 0) + 1;
    localStorage.setItem("qtd", String(orderNumber));
    
    const formatarData = () => {
        const data = new Date();
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, "0");
        const minutos = String(data.getMinutes()).padStart(2, "0");
        const segundos = String(data.getSeconds()).padStart(2, "0");

        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    };

    const dataFormatada = formatarData();

    const obsFormatada = observacao
        .split("\n")
        .map((palavra, index) => (
            <p key={index}><strong>Obs.:</strong> {palavra} <br /></p>
        ));

    return (
        <div key={1} style={{ padding: "-8px", margin: "-8px" }}>
            <span>=========================================================</span>
            <h1 style={{ fontSize: "25px", textAlign: "center" }}>Cléo Nogueira Lanches</h1>
            <span>=========================================================</span>
            <div style={{ padding: "0 8px" }}>
                <p><strong>PEDIDO: N° {orderNumber}</strong></p>
                <p>{dataFormatada}</p>
                <p>Cliente: {nome}</p>
            </div>
            <span>=========================================================</span>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                <p>QTDE.</p>
                <p>PRATO</p>
                <p>PREÇO</p>
            </div>
            <span>=========================================================</span>
            {items.map(item =>
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
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
                {obsFormatada} 
            </div>
            <div style={{ textAlign: "center" }}>
                <span>................................................................</span>
                <span>................................................................</span>
                <p>OBRIGADO, VOLTE SEMPRE! :)</p>
            </div>
        </div>
    )
}