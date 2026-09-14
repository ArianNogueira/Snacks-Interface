# Pix PagBank — preparação e ativação

A integração fica desativada por padrão. Nenhuma credencial foi adicionada e nenhuma migração foi executada no banco remoto. As formas de pagamento existentes continuam disponíveis. O Pix integrado é oferecido apenas no checkout do cliente, não no caixa interno.

## Configuração no servidor

No `.env.local` para desenvolvimento e nas variáveis de ambiente da Vercel:

```dotenv
PAGBANK_PIX_ENABLED=false
PAGBANK_ENVIRONMENT=sandbox
PAGBANK_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=https://seu-dominio.vercel.app
```

Manter também `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existentes. Nunca usar `NEXT_PUBLIC_` para token PagBank ou service role. Não compartilhar segredos no chat, Git ou logs. Na Vercel, separar Preview e Production e fazer novo deploy após alterar variáveis. APP_URL deve ser a origem HTTPS exata aberta pelo cliente; localmente pode ser http://localhost:3000, mas notificações precisam de HTTPS público.

## Ordem de ativação

1. Obter chave Pix ativa e token Sandbox no PagBank.
2. Conferir o esquema real do Supabase e testar a migração `supabase/migrations/202609110001_pagbank_pix.sql` em banco de testes. Este checkout usa as funções existentes `submit_order_with_delivery`, `track_order` e `update_order_status`; suas definições não estão neste repositório. Confirmar que aceitam `Pix PagBank`, que o total é calculado pelos preços do banco, que o token de acompanhamento é aleatório e não é acessível a terceiros, e que as políticas existentes restringem a leitura dos pedidos. Corrigir qualquer incompatibilidade antes de habilitar.
3. Aplicar a migração revisada. Ela cria tabela privada e campos de resumo nos pedidos, bloqueia alteração indevida do pagamento e avanço de Pix não pago. Não substitui as funções de pedidos existentes.
4. Configurar as variáveis em um Preview com banco de testes. Definir `PAGBANK_PIX_ENABLED=true` somente nesse ambiente. Usar URL estável e permitir acesso externo ao webhook se houver proteção de deploy da Vercel.
5. Testar criação, QR Code, Copia e Cola, refresh, duas chamadas simultâneas, timeout seguido de retomada, expiração, recusa, pagamento, notificação repetida, assinatura inválida e valor divergente. Confirmar painel, bloqueio de preparo no banco e faturamento. Simular conforme ferramentas oferecidas pelo Sandbox PagBank.
6. Solicitar homologação ao PagBank. Depois da liberação, configurar credenciais próprias de produção e `PAGBANK_ENVIRONMENT=production`; publicar e validar recebimento antes de oferecer amplamente.

## Funcionamento

O cliente envia o pedido normalmente e abre o acompanhamento pelo token existente. Ao escolher Pix, informa CPF/CNPJ e e-mail nessa página e solicita a cobrança. O servidor consulta o valor persistido no banco (inclusive entrega), salva uma referência/payload único por pedido e cria a cobrança com a mesma chave de idempotência em todas as tentativas. CPF/CNPJ e e-mail ficam apenas na tabela privada durante a criação e o payload é apagado após registrar a resposta do provedor.

`POST /api/pix/webhook` valida SHA-256 de `token-corpoOriginal` contra `x-authenticity-token`. Consulta o pedido no PagBank e confere referência, moeda, método e valor. A gravação de pagamento e resumo do pedido ocorre na mesma transação; respostas antigas não desfazem confirmação. O acompanhamento consulta o provedor como recuperação de notificações atrasadas. A imagem é obtida pelo servidor, sem expor credenciais.

O painel mostra o status e mantém a aceitação do pedido manual. Pagamento em pedido cancelado é registrado, sem reabrir o pedido. O faturamento considera somente Pix pago, na data de pagamento, preservando a regra anterior para dinheiro/cartão. Os valores são brutos, sem descontar tarifas; esta tela não substitui conciliação financeira nem contabiliza devoluções parciais.

## Limites desta primeira versão

- Uma cobrança por pedido, validade solicitada de 15 minutos. Expiração/recusa orienta contato com a loja; renovação automática e devolução pela API não foram incluídas para evitar cobranças concorrentes. Devoluções são operadas no PagBank.
- Não há job de conciliação periódica independente: há webhook e recuperação enquanto a página do cliente está aberta. Configurar rotina de conciliação antes de exigir recuperação sem visitas, incluindo devoluções posteriores.
- O checkout existente ainda pode criar pedidos duplicados em caso de falha de rede no envio inicial; a proteção nova garante uma cobrança por pedido já salvo. Antes da ativação, validar esse fluxo nas funções atuais do banco e implementar idempotência do envio se necessário.
- Registros em que houve timeout sem resposta preservam payload privado para retomada; definir rotina de retenção/limpeza após reconciliação, sem apagar tentativas de resultado desconhecido.
- Rate limiting distribuído deve ser configurado na Vercel para `/api/pix` e limites de tamanho de requisição no ambiente público. Não bloquear notificações legítimas do PagBank.
- Testes reais, migração SQL e homologação dependem do ambiente e das credenciais. Não considerar apenas o build como homologação.

## Validação local

```sh
node --test tests/pagbank.test.cjs
npx tsc --noEmit
npm run build
```

Referências: [Pix Order v2](https://developer.pagbank.com.br/reference/criar-pedido-com-qr-code-pix-v2), [assinatura](https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao), [idempotência](https://developer.pagbank.com.br/docs/chaves-publicas-e-de-idempotencia), [homologação](https://developer.pagbank.com.br/docs/solicitar-homologacao).
