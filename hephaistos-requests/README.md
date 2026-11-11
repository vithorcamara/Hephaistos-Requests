# Hephaistos Requests

Cliente HTTP em React/Vite para enviar requisições e inspecionar respostas.

## Desenvolvimento

Configure a origem da API em `.env.local` na raiz do projeto:

```env
API_PROXY_TARGET=https://sua-api.example
```

Informe somente a origem HTTP(S), sem credenciais, caminho ou query. Esse valor
é lido pelo servidor de desenvolvimento do Vite e não é incluído no bundle do
navegador. O app envia as chamadas para `/api-proxy`, e o Vite encaminha a rota
ao destino configurado.

Depois, inicie o app:

```sh
npm run dev
```

O proxy existe apenas no servidor de desenvolvimento. Um build publicado não
inclui esse proxy; para produção, configure CORS na API ou use um backend
privado com autenticação e uma origem permitida fixa.
