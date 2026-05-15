# AutoRecall CRM

Sistema de gestão para oficinas mecânicas que automatiza o retorno de clientes via WhatsApp, organiza ordens de serviço e aumenta o faturamento recorrente.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript** estrito
- **Tailwind CSS v3** + **shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage)
- **Recharts** (gráficos do dashboard)
- **Evolution API** (WhatsApp)
- **Asaas** (PIX e cobranças)

## Funcionalidades

- ✅ Autenticação completa (login, cadastro, recuperação de senha)
- ✅ Dashboard com dados reais do Supabase
- ✅ CRUD completo: Clientes, Veículos, Ordens de Serviço
- ✅ Criação e envio de orçamentos via WhatsApp
- ✅ Sistema de lembretes automáticos
- ✅ Cobrança via PIX (Asaas)
- ✅ Webhooks (Asaas e Evolution)
- ✅ RLS habilitado no Supabase
- ✅ Responsivo (mobile-first)
- ✅ Dark/Light mode
- ✅ Onboarding wizard

## Pré-requisitos

- Node.js 18+
- Supabase project
- Evolution API instance
- Asaas account (sandbox)

## Setup

1. Clone o repositório:
```bash
git clone <url>
cd autorecall-crm
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de ambiente:
```bash
cp .env.local.example .env.local
```

4. Preencha as variáveis de ambiente no `.env.local`:
   - Supabase: URL, Anon Key, Service Role Key
   - Evolution API: URL, Key, Instance
   - Asaas: API Key
   - App URL

5. Execute o schema SQL no Supabase:
   - Abra o SQL Editor no Supabase
   - Cole e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── (dashboard)/     # Páginas do dashboard
│   ├── api/             # API routes
│   └── public/          # Páginas públicas
├── components/
│   ├── layout/          # Sidebar, Topbar, UserMenu
│   ├── dashboard/       # Cards, Gráficos
│   ├── customers/       # Tabela, Formulário
│   ├── vehicles/        # Tabela, Formulário, Card
│   ├── service-orders/  # Tabela, Formulário, Editors
│   ├── estimates/       # Builder, ApprovalCard
│   ├── reminders/       # Calendar
│   ├── charges/         # Form, PixViewer
│   ├── settings/        # WhatsApp, Templates, Billing
│   └── shared/          # StatusBadge, SearchInput, Filters
├── hooks/               # Custom hooks
├── lib/                 # API wrappers
├── services/            # Business logic
├── types/               # TypeScript types
└── utils/               # Formatters, validators
```

## Deploy

### Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático na branch main

### Supabase

O banco de dados e a autenticação são gerenciados pelo Supabase. O schema está em `supabase/migrations/001_initial_schema.sql`.

## Licença

MIT
