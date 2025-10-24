# 🚀 Caixa Radar - Sistema de Fluxo de Caixa# React + TypeScript + Vite



Sistema completo de gestão de fluxo de caixa com projeção financeira, desenvolvido com React, TypeScript, Vite e Supabase.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## ✨ FuncionalidadesCurrently, two official plugins are available:



- 🔐 **Autenticação segura** via Magic Link (email)- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- 💰 **Gestão de saldo** com atualização automática- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- 📊 **Dashboard interativo** com gráficos de projeção

- 💸 **Controle de receitas e despesas**## React Compiler

- ✅ **Marcar transações como pagas/pendentes**

- 🔍 **Filtros avançados** (todas, pagas, não pagas, próximas)The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- 📈 **Projeção de caixa** para 30 dias

- 📥 **Export para CSV**## Expanding the ESLint configuration

- 🎨 **Interface moderna e responsiva**

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

## 🛠️ Tecnologias

```js

- **Frontend**: React 19 + TypeScript + Viteexport default defineConfig([

- **Backend**: Supabase (PostgreSQL + Auth + Realtime)  globalIgnores(['dist']),

- **Gráficos**: Recharts  {

- **Estilo**: CSS-in-JS (inline styles)    files: ['**/*.{ts,tsx}'],

    extends: [

## 📋 Pré-requisitos      // Other configs...



- Node.js 20.19+ ou 22.12+      // Remove tseslint.configs.recommended and replace with this

- Conta no [Supabase](https://supabase.com)      tseslint.configs.recommendedTypeChecked,

- Git      // Alternatively, use this for stricter rules

      tseslint.configs.strictTypeChecked,

## 🚀 Instalação e Configuração      // Optionally, add this for stylistic rules

      tseslint.configs.stylisticTypeChecked,

### 1. Clone o repositório

      // Other configs...

```bash    ],

git clone https://github.com/samuel05015/Fluxo-de-Caixa.git    languageOptions: {

cd Fluxo-de-Caixa/caixa-radar      parserOptions: {

npm install        project: ['./tsconfig.node.json', './tsconfig.app.json'],

```        tsconfigRootDir: import.meta.dirname,

      },

### 2. Configure o Supabase      // other options...

    },

#### Passo 1: Crie um projeto no Supabase  },

1. Acesse [supabase.com](https://supabase.com) e faça login])

2. Clique em **"New Project"**```

3. Escolha um nome, senha do banco e região

4. Aguarde a criação (2-3 minutos)You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



#### Passo 2: Execute o SQL de configuração```js

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)// eslint.config.js

2. Clique em **"New Query"**import reactX from 'eslint-plugin-react-x'

3. Abra o arquivo `supabase-setup.sql` deste projetoimport reactDom from 'eslint-plugin-react-dom'

4. **Copie TODO o conteúdo** e cole no editor SQL

5. Clique em **"Run"** (ou pressione Ctrl+Enter)export default defineConfig([

6. ✅ Verifique se apareceu "Success. No rows returned"  globalIgnores(['dist']),

  {

#### Passo 3: Configure a autenticação por email    files: ['**/*.{ts,tsx}'],

1. No Supabase, vá em **Authentication** > **Providers**    extends: [

2. Procure por **Email** e clique em **Edit**      // Other configs...

3. Configure:      // Enable lint rules for React

   - ✅ **Enable Email provider**      reactX.configs['recommended-typescript'],

   - ✅ **Confirm email** (opcional para produção)      // Enable lint rules for React DOM

4. Clique em **Save**      reactDom.configs.recommended,

    ],

#### Passo 4: Configure as credenciais no projeto    languageOptions: {

1. No Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**      parserOptions: {

2. Copie:        project: ['./tsconfig.node.json', './tsconfig.app.json'],

   - **Project URL** (ex: `https://xyzcompany.supabase.co`)        tsconfigRootDir: import.meta.dirname,

   - **anon/public key** (chave longa começando com `eyJ...`)      },

      // other options...

3. Abra o arquivo `src/supabaseClient.ts` no seu projeto    },

  },

4. Substitua as variáveis:])

```

```typescript
const supabaseUrl = 'https://xyzcompany.supabase.co'; // Cole sua URL aqui
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Cole sua chave aqui
```

### 3. Execute o projeto

```bash
npm run dev
```

✅ Acesse: **http://localhost:5173**

## 📖 Como Usar

### 1️⃣ **Primeiro Login**
- Digite seu email no campo
- Clique em "Receber link"
- Abra seu email e clique no link mágico
- Você será redirecionado e autenticado automaticamente

### 2️⃣ **Adicionar Transação**
- **Descrição**: Ex: "Salário", "Aluguel", "Freelance"
- **Valor**: Digite o valor (sempre positivo)
- **Data**: Escolha a data
- **É uma despesa?**: 
  - ✅ Marcado = Despesa (sai do caixa)
  - ❌ Desmarcado = Receita (entra no caixa)
- Clique em **"Adicionar Lançamento"**

### 3️⃣ **Gerenciar Saldo**
- Transações novas ficam como **"⏳ Pendente"** (não afetam o saldo ainda)
- Quando o dinheiro **entrar/sair** de fato, clique em **"Marcar como pago"**
- O **Saldo Atual** atualiza automaticamente
- Para reverter, clique em **"Desmarcar"**

### 4️⃣ **Visualizar Projeção**
- O gráfico mostra como seu saldo vai ficar nos próximos 30 dias
- Considera apenas transações **não pagas**
- Atualiza automaticamente ao adicionar/editar

### 5️⃣ **Filtrar Transações**
- **Todas**: Mostra tudo
- **Próximas**: Apenas futuras e não pagas
- **Pagas**: Apenas realizadas
- **Não pagas**: Apenas pendentes

### 6️⃣ **Exportar para CSV**
- Clique em **"Exportar CSV"** para baixar todas as transações
- Abra no Excel, Google Sheets ou qualquer planilha

## 🗂️ Estrutura do Banco de Dados

### Tabela: `profiles`
```sql
id              UUID (referencia auth.users)
current_balance DECIMAL (saldo atual do usuário)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabela: `transactions`
```sql
id          UUID (chave primária)
user_id     UUID (referencia auth.users)
description TEXT (descrição da transação)
amount      DECIMAL (valor: + receita, - despesa)
due_date    DATE (data da transação)
is_paid     BOOLEAN (pago ou pendente)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

## 🔒 Segurança

- ✅ **Row Level Security (RLS)** habilitado
- ✅ Usuários só veem seus próprios dados
- ✅ Impossível acessar dados de outros usuários
- ✅ Autenticação segura via Magic Link
- ✅ Tokens JWT gerenciados automaticamente

## 🐛 Problemas Comuns

### ❌ Erro: "Failed to fetch" ao fazer login
**Solução:**
- Verifique se as credenciais do Supabase estão corretas em `src/supabaseClient.ts`
- Confirme que a autenticação por email está habilitada no Supabase
- Verifique sua conexão com a internet

### ❌ Erro: "Relation 'profiles' does not exist"
**Solução:**
- Execute o script `supabase-setup.sql` completo no SQL Editor do Supabase
- Verifique se todas as queries foram executadas sem erros (deve aparecer "Success")

### ❌ Saldo não atualiza
**Solução:**
- Certifique-se de **marcar a transação como "Paga"**
- Recarregue a página (F5)
- Verifique se existe um registro na tabela `profiles` para seu usuário

### ❌ Dados não persistem após reload
**Solução:**
- Verifique se você está logado (deve mostrar botão "Sair")
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique as políticas RLS no Supabase (SQL Editor > "SELECT * FROM pg_policies")

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Opção 2: Netlify

```bash
npm run build
# Faça upload da pasta dist/ no Netlify
```

**⚠️ IMPORTANTE**: No serviço de hosting, configure as variáveis de ambiente:
- `VITE_SUPABASE_URL` = sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY` = sua chave anon

## 📁 Estrutura do Projeto

```
caixa-radar/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Login via Magic Link
│   │   └── Dashboard.tsx      # Dashboard principal
│   ├── App.tsx                # Componente raiz
│   ├── supabaseClient.ts      # Configuração Supabase ⚙️
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── supabase-setup.sql         # Script SQL do banco 🗄️
├── package.json
├── vite.config.ts
└── README.md
```

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Adiciona MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

## 📝 Licença

MIT License - use livremente!

## 👨‍💻 Autor

**Samuel**
- GitHub: [@samuel05015](https://github.com/samuel05015)
- Repositório: [Fluxo-de-Caixa](https://github.com/samuel05015/Fluxo-de-Caixa)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend completo
- [Vite](https://vitejs.dev) - Build tool super rápido
- [Recharts](https://recharts.org) - Gráficos lindos
- [React](https://react.dev) - Framework incrível

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐
