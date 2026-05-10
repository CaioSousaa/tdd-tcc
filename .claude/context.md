# SDD — Contexto do Projeto

Projeto de TCC. Monorepo com backend em Express/TypeScript e frontend em Next.js/React.

> **Regra obrigatória**: toda implementação de RF cobre **backend e frontend**.
> Todo arquivo gerado a partir deste contexto deve refletir essa obrigatoriedade.

## Stack

### Backend (`sdd-backend/`)
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Linguagem**: TypeScript 6
- **Banco**: MongoDB via Mongoose (ainda não adicionado)
- **Auth**: JWT (ainda não adicionado)
- **Dev**: `npm run dev` (nodemon + ts-node) na porta definida em `.env` (padrão 3333)

### Frontend (`sdd-frontend/`)
- **Framework**: Next.js 16 — App Router (cada pasta em `app/` é uma rota)
- **UI**: React 19 + Tailwind CSS v4
- **Linguagem**: TypeScript 5
- **HTTP**: Axios com interceptor de autenticação (a criar em `lib/axios.ts`)
- **Dev**: `npm run dev`

> **Atenção**: O Next.js 16 tem breaking changes em relação a versões anteriores.
> Antes de gerar código Next.js, leia os guias em `node_modules/next/dist/docs/`.

## Design

- **Cor primária**: `amber-400`
- **Cor de fundo**: `zinc-900`
- Tema escuro por padrão

## Estrutura de pastas

### Backend
```
src/
├── main/               # Ponto de entrada da aplicação
├── routes/             # Rotas por domínio
├── modules/            # Módulos de domínio (Clean Architecture)
|   └── dto/
|   └── factories/      
|   └── port/           #Interface exportando os metodos que serao implementados
|   └── services/
|   └── infra/
|     └── controllers/
|     └── repository/
├── infra/
│   └── mongo/schemas/  # Schemas do Mongoose
├── config/             # Configurações globais (ex: JWT)
├── shared/
│   └── http/           # Middlewares
└── adapters/           # Utilitários compartilhados
```

### Frontend
```
app/                    # App Router — cada pasta é uma rota
├── globals.css
├── layout.tsx
└── page.tsx
components/             # Componentes reutilizáveis
types/
└── index.ts            # Tipos compartilhados
lib/
└── axios.ts            # Instância do Axios com interceptor de auth
```

### Requistos
RF1 – O sistema deve permitir que o usuário se cadastre informando nome, e-mail e senha.
RF2 – O sistema deve autenticar o usuário via e-mail e senha, retornando um JWT de acesso.
RF3 – O sistema deve garantir que cada usuário acesse apenas suas próprias tarefas e notificações.
RF4 – O sistema deve permitir que o usuário crie uma tag informando nome e cor.
RF5 – O sistema deve permitir que o usuário edite e exclua suas próprias tags.
RF6 – O sistema deve permitir que o usuário liste todas as suas tags.
RF7 – O sistema deve permitir que o usuário crie novas tarefas informando título, descrição, status, tags, prioridade e data de vencimento.
RF8 – O sistema deve permitir o usuário editar todas as informações de uma tarefa.
RF9 – O sistema deve permitir o usuário excluir qualquer tarefa, pedindo confirmação antes de excluir.
RF10 – O sistema deve exibir as tarefas do usuário divididas em três colunas (Todo, In Progress e Done), ordenadas por prioridade e data de vencimento.
RF11 – O sistema deve permitir que o usuário filtre suas tarefas por prioridade e tags.
RF12 – O sistema deve agendar um job automaticamente ao definir um alerta em uma tarefa.
RF13 – O sistema deve criar uma notificação quando o horário do alerta de uma tarefa for atingido.
RF14 – O sistema deve permitir que o usuário marque uma notificação como lida.
RF15 – O sistema deve exibir um menu do usuário com opções de configurações (permitindo alterar nome e senha), logout e notificações.

Schemas:
User 
{  
  _id,
  name, 
  email, 
  password, 
  createdAt
}

Task
{ 
  _id, 
  title,  
  description,  
  status: "todo" | "in_progress" | "done",  
  priority: "low" | "medium" | "high", 
  dueDate,  
  owner: ObjectId -> User, 
  tags: [ObjectId -> Tag],
  alert?: string
  createdAt, 
  updatedAt
}

Notification
{  
  _id, 
  owner: ObjectId -> User, 
  task: ObjectId -> Task,  
  message: string,  
  read: boolean,  
  createdAt
}

Tag
{ 
  _id,  
  name,  
  color,  
  owner: ObjectId -> User,  
  createdAt
}