# Albion Market Analyzer 📈

Sistema completo de análise de mercado para **Albion Online** focado em identificar oportunidades de flip (compra e venda para lucro).

Inspirado no visual do TradingView, Binance e PoE Ninja — Dark Mode by default, responsivo, profissional.

---

## 🚀 Deploy com 1 Clique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/albion-market-analyzer&env=DATABASE_URL,DIRECT_URL,ALBION_API_BASE_URL&envDescription=Veja%20o%20.env.example%20para%20refer%C3%AAncia&envLink=https://github.com/SEU_USUARIO/albion-market-analyzer/blob/main/.env.example&project-name=albion-market-analyzer&repository-name=albion-market-analyzer)

### Como usar o botão acima:

1. **Suba o projeto no GitHub** (veja instruções abaixo)
2. **Clique no botão** — a Vercel vai pedir 3 variáveis:
   - `DATABASE_URL` → sua URL do [Neon PostgreSQL](https://neon.tech) (pooled)
   - `DIRECT_URL` → sua URL do Neon (direct/unpooled)
   - `ALBION_API_BASE_URL` → cole exatamente: `https://west.albion-online-data.com/api/v2`
3. **Clique em Deploy** — aguarde ~2 minutos
4. **Após o deploy**, vá em **Settings → Functions → Console** e rode:
   ```
   npx prisma db push
   ```
5. Acesse o link gerado e clique em **"Sincronizar"** no dashboard!

### Subir no GitHub (passo a passo):

```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "Initial commit"
gh repo create albion-market-analyzer --public --push
# (requer GitHub CLI instalado: https://cli.github.com)
```

Ou pelo site: [github.com/new](https://github.com/new) → crie o repositório → faça upload dos arquivos.

---

## 🖥️ Screenshots

- **Dashboard** — Tabela de oportunidades em tempo real com filtros avançados
- **Rankings** — Top 50 melhores flips, maior ROI e maior lucro
- **Alertas** — Sistema de notificações sonoras e toasts

---

## ✨ Funcionalidades

- ✅ Identificação automática de oportunidades de flip
- ✅ Cálculo de Lucro Bruto, Líquido e ROI
- ✅ Filtros por Cidade, Tier, Encantamento, Qualidade, ROI e Lucro mínimos
- ✅ Rankings Top 50 (Flips, ROI, Lucro)
- ✅ Sincronização automática a cada 60 segundos
- ✅ Alertas sonoros + Toasts quando ROI ≥ threshold
- ✅ Sistema de alertas configurável por item/cidade
- ✅ Paginação e ordenação por qualquer coluna
- ✅ Taxa de mercado e taxa premium configuráveis
- ✅ Imagens dos itens via Albion Render API
- ✅ Cron job automático na Vercel

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, React 18, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Estado | Zustand + React Query |
| Backend | Next.js API Routes |
| Banco | PostgreSQL (Neon) + Prisma ORM |
| Deploy | Vercel |
| API | Albion Online Data Project |

---

## 📁 Estrutura de Diretórios

```
albion-market/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alerts/        # CRUD de alertas
│   │   │   ├── market/        # Dados de mercado + sync + stats
│   │   │   └── rankings/      # Top 50 rankings
│   │   ├── alerts/            # Página de alertas
│   │   ├── dashboard/         # Página principal
│   │   ├── rankings/          # Página de rankings
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Redirect → /dashboard
│   │   └── providers.tsx      # React Query provider
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── MarketFilters.tsx
│   │   │   ├── MarketTable.tsx
│   │   │   ├── Rankings.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── StatsCards.tsx
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── useMarketData.ts
│   │   └── useSound.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── albion.ts      # Albion API client
│   │   │   ├── items.ts       # Itens + utilitários
│   │   │   └── sync.ts        # Serviço de sincronização
│   │   ├── db/
│   │   │   └── prisma.ts      # Singleton Prisma
│   │   └── utils.ts           # Utilitários gerais
│   ├── store/
│   │   └── index.ts           # Zustand store
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                # Cron job config
```

---

## ⚙️ Configuração Local

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- PostgreSQL (local ou Neon)

### 1. Clone e instale dependências

```bash
git clone <seu-repo>
cd albion-market
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
# Banco de dados PostgreSQL (local ou Neon)
DATABASE_URL="postgresql://user:password@localhost:5432/albion_market"
DIRECT_URL="postgresql://user:password@localhost:5432/albion_market"

# URL do app
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_REFRESH_INTERVAL="60000"

# API do Albion (sem necessidade de chave)
ALBION_API_BASE_URL="https://west.albion-online-data.com/api/v2"
```

> **Para PostgreSQL local:**
> ```bash
> createdb albion_market
> ```

### 3. Configure o banco de dados

```bash
# Gera o cliente Prisma
npm run db:push

# (Opcional) Popula com dados iniciais
npm run db:seed
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Sincronize os dados do mercado

No dashboard, clique em **"Sincronizar"** ou acesse:

```
POST http://localhost:3000/api/market/sync
```

Aguarde ~30–60 segundos para a primeira sincronização completa.

---

## 🔢 Cálculos de Lucro

### Lucro Bruto
```
Lucro Bruto = Preço de Venda - Preço de Compra
```

### Lucro Líquido
```
Taxa Total = Taxa de Mercado + Taxa Premium
Taxa Aplicada = Preço de Venda × Taxa Total
Lucro Líquido = Lucro Bruto - Taxa Aplicada
```

### ROI
```
ROI (%) = (Lucro Líquido / Preço de Compra) × 100
```

### Valores Padrão
| Taxa | Valor |
|------|-------|
| Taxa de Mercado (sem premium) | 2.5% |
| Taxa Premium | 0% (configurável) |
| Com premium ativo | 3.0% total |

---

## 🌐 Deploy na Vercel

### 1. Crie um banco Neon PostgreSQL

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Copie as connection strings:
   - **DATABASE_URL** (pooled connection)
   - **DIRECT_URL** (direct connection)

### 2. Configure o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e conecte seu repositório Git
2. Em **Settings → Environment Variables**, adicione:

```
DATABASE_URL=postgresql://...@pooler.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://...@ep-xxx.neon.tech/dbname?sslmode=require
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
ALBION_API_BASE_URL=https://west.albion-online-data.com/api/v2
```

### 3. Deploy

```bash
# Instale Vercel CLI
npm i -g vercel

# Faça deploy
vercel --prod
```

Ou simplesmente faça push para a branch `main` se conectou via GitHub.

### 4. Execute as migrations

Após o primeiro deploy, no painel Vercel em **Functions → Run Command**:

```bash
npx prisma db push
```

Ou via CLI local com as variáveis de produção:

```bash
DATABASE_URL="sua-url-neon" npx prisma db push
```

### 5. Cron Job automático

O arquivo `vercel.json` já configura o cron para executar a cada minuto:

```json
{
  "crons": [
    {
      "path": "/api/market/sync",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

> ⚠️ Cron jobs requerem plano **Vercel Pro** para intervalos < 1 hora.
> Para o plano gratuito, use `"0 * * * *"` (a cada hora).

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/market` | Lista oportunidades com filtros e paginação |
| GET | `/api/market/stats` | Estatísticas gerais (overview) |
| POST | `/api/market/sync` | Dispara sincronização manual |
| GET | `/api/market/sync` | Sincronização via GET (para cron) |
| GET | `/api/rankings` | Top 50 rankings |
| GET | `/api/alerts` | Lista alertas |
| POST | `/api/alerts` | Cria alerta |
| DELETE | `/api/alerts?id=xxx` | Remove alerta |

### Parâmetros de Filtro (`/api/market`)

| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (padrão: 1) |
| `limit` | number | Itens por página (máx: 100) |
| `city` | string | Filtrar por cidade |
| `tier` | number | Filtrar por tier (2-8) |
| `enchantment` | number | Filtrar por encantamento (0-4) |
| `quality` | number | Filtrar por qualidade (1-5) |
| `minRoi` | number | ROI mínimo (%) |
| `minProfit` | number | Lucro líquido mínimo (silver) |
| `search` | string | Busca por nome do item |

---

## 🎮 API do Albion Online Data Project

Este projeto consome a API pública gratuita do [Albion Online Data Project](https://www.albion-online-data.com/).

**Endpoint base:** `https://west.albion-online-data.com/api/v2`

**Exemplo de chamada:**
```
GET /stats/prices/T6_MAIN_SWORD,T7_MAIN_SWORD?locations=Caerleon,Bridgewatch&qualities=1,2,3
```

A API não requer autenticação. Os dados são coletados pela comunidade via client-side addon.

---

## 🎨 Customização

### Adicionar mais itens

Edite `src/lib/api/items.ts` e adicione IDs ao array `TRADEABLE_ITEMS`:

```typescript
export const TRADEABLE_ITEMS: string[] = [
  // ... itens existentes
  "T8_2H_CLAYMORE",
  "T8_2H_CLAYMORE@1",
  "T8_2H_CLAYMORE@2",
  "T8_2H_CLAYMORE@3",
];
```

### Mudar taxa de mercado padrão

Edite `src/lib/api/sync.ts`:

```typescript
const DEFAULT_MARKET_FEE = 0.025; // 2.5%
const DEFAULT_PREMIUM_FEE = 0.0;  // 0% (sem premium)
```

### Ajustar intervalo de sincronização

**Local:** modifique `refreshInterval` nas settings do app.

**Vercel Cron:** edite `vercel.json`:
```json
"schedule": "*/5 * * * *"  // A cada 5 minutos
```

---

## 🔧 Comandos Úteis

```bash
# Dev
npm run dev              # Servidor de desenvolvimento

# Build
npm run build            # Build de produção
npm run start            # Iniciar produção local

# Banco
npm run db:push          # Aplica schema sem migrations
npm run db:migrate       # Cria e aplica migration
npm run db:studio        # Abre Prisma Studio (GUI)
npm run db:seed          # Popula dados iniciais

# Linting
npm run lint             # Verifica código
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add: nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📜 Licença

MIT — use livremente para projetos pessoais e comerciais.

---

## ⚠️ Aviso

Este projeto é **não-oficial** e não é afiliado à Sandbox Interactive GmbH (criadores do Albion Online). Os dados de mercado são fornecidos pela comunidade via [Albion Online Data Project](https://www.albion-online-data.com/).
