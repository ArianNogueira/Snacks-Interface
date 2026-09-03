interface Dish {
    id: number;
    nome: string;
    preco: number;
    precoUnitario: number;
    quantidade: number;
}

export function BrintableTicket(items: Dish[], metodoPagamento: string, total: number, nome: string, observacao: string, orderNumber: number, periodo: string, createdAt: string) {
    
    const formatarData = () => {
        const data = new Date(createdAt);
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, "0");
        const minutos = String(data.getMinutes()).padStart(2, "0");
        const segundos = String(data.getSeconds()).padStart(2, "0");

        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    };

    const dataFormatada = formatarData();

    const emphasizedLabels = /^(Telefone|Entrega|Taxa de entrega|Endereço|Observação):\s*(.*)$/i;
    const obsFormatada = observacao
        .split("\n")
        .map((line, index) => {
            const match = line.trim().match(emphasizedLabels);
            if (!match) return <p key={index}>{line}</p>;
            return <p key={index}><strong>{match[1]}:</strong> {match[2]}</p>;
        });

    return (
        <div key={1} className="thermal-ticket">
            <div className="ticket-separator" />
            <h1 style={{ fontSize: "25px", textAlign: "center" }}>Cléo Nogueira Lanches</h1>
            <div className="ticket-separator" />
            <div>
                <p><strong>PEDIDO: N° {orderNumber}</strong></p>
                <p>Período: {periodo}</p>
                <p>{dataFormatada}</p>
                <p>Cliente: {nome}</p>
            </div>
            <div className="ticket-separator" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>QTDE.</p>
                <p>PRATO</p>
                <p>PREÇO</p>
            </div>
            <div className="ticket-separator" />
            {items.map(item =>
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "12mm 1fr 22mm", gap: "2mm", alignItems: "start" }}>
                    <p style={{ textAlign: "center" }}>{item.quantidade}</p>
                    <p style={{ overflowWrap: "anywhere" }}>{item.nome}</p>
                    <p style={{ textAlign: "right", whiteSpace: "nowrap" }}>R$ {item.preco.toFixed(2)}</p>
                </div>
            )}
            <div className="ticket-separator" />
            <div>
                <p style={{ textAlign: "right" }}>TOTAL: R$ {total.toFixed(2)}</p>
                <p><strong>Método de Pagamento:</strong> {metodoPagamento}</p>
            </div>
            <div className="ticket-separator" />
            <div>
                <p>Atendente: Taia</p>
                {obsFormatada} 
            </div>
            <div style={{ textAlign: "center" }}>
                <div className="ticket-separator" />
                <p>OBRIGADO, VOLTE SEMPRE! :)</p>
            </div>
        </div>
    )
}
