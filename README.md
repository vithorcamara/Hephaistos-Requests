# Hephaistos Requests

O app React/Vite está em [`hephaistos-requests/`](./hephaistos-requests/).

Para executar em desenvolvimento, configure o destino fixo da API em
`hephaistos-requests/.env.local`:

```env
API_PROXY_TARGET=https://sua-api.example
```

Use somente a origem HTTP(S), sem credenciais, caminho ou query. Em seguida,
inicie o Vite:

```sh
cd hephaistos-requests
npm run dev
```

O proxy evita CORS somente no servidor de desenvolvimento; não é incluído em
builds de produção. Veja o [README do app](./hephaistos-requests/README.md) para
mais detalhes.