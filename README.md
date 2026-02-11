# Desafio Afya – Backend de Prontuário Eletrônico

API REST robusta em Node.js/TypeScript para gestão de pacientes e agendamentos médicos.

Este projeto foi desenvolvido seguindo **SOLID Principles** e **Clean Architecture**, com foco em desacoplamento, testabilidade e qualidade de código.

---

## 🚀 Tecnologias e Ferramentas

- **Linguagem**: Node.js + TypeScript
- **Framework**: Express
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma IO
- **Validação**: Zod
- **Autenticação**: JWT (JSON Web Tokens) com rotação de sessão
- **Documentação**: Swagger UI (OpenAPI 3.0)
- **Qualidade de Código**: ESLint, Husky (pre-commit hooks), Lint-staged
- **Testes**: Jest (Unitários e Integração)
- **Containerização**: Docker
- **CI/CD**: GitHub Actions
- **Deploy**: Render (Docker + PostgreSQL)

---

## 🏗️ Arquitetura

O projeto foi refatorado para seguir boas práticas de engenharia de software:

- **Dependency Inversion Principle (DIP)**: Controllers e Services dependem de interfaces (`IPatientRepository`), não de implementações concretas e acopladas ao banco.
- **Dependency Injection (DI)**: Injeção de dependências manual via construtores, centralizada no arquivo de rotas (Composition Root).
- **Repository Pattern**: Abstração da camada de dados.
- **DTOs**: Uso de Zod para validação robusta de entrada de dados.

---

## ⚡ Setup e Execução Local

### Pré-requisitos

- Node.js (v18+)
- Docker e Docker Compose

### Instalação Rápida (Recomendado)

Utilize o script de setup que configura o ambiente, instala dependências, roda as migrations e cria um usuário padrão.

1. Suba o banco de dados:
   ```bash
   docker-compose up -d
   ```

2. Crie o arquivo `.env` (se não existir, use o exemplo abaixo):
   ```env
   DATABASE_URL="postgresql://admin:password@localhost:5432/afya_db?schema=public"
   PORT=3000
   JWT_SECRET="segredo-muito-seguro-123"
   ```

3. Execute o script de setup:
   ```bash
   npm run setup
   ```
   *Este script irá instalar dependências (`npm i`), rodar migrations (`prisma migrate`) e criar o usuário médico padrão.*

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

O servidor estará rodando em `http://localhost:3000`.

---

## 🌐 Deploy no Render

Este projeto já vem configurado com um Arquivo Blueprint (`render.yaml`) para facilitar o deploy no Render.

1. Crie uma conta no [Render.com](https://render.com/).
2. No Dashboard, clique em **"New +"** e selecione **"Blueprint"**.
3. Conecte seu repositório GitHub.
4. O Render detectará automaticamente o arquivo `render.yaml` e criará:
   - Um **PostgreSQL** (versão Free).
   - Um **Web Service** (via Docker).
5. Clique em **Apply** e aguarde o build.

*Nota: O script de start (`npm start`) já está configurado para rodar as migrations do banco de dados automaticamente antes de iniciar a API.*

---

## 📖 Documentação da API (Swagger)

A documentação interativa está disponível em:

👉 **[http://localhost:3000/api](http://localhost:3000/api)**

### Como Autenticar no Swagger

1. Na interface do Swagger, vá até o endpoint **`POST /login`**.
2. Clique em **Try it out** e execute com as credenciais padrão:
   - **Email**: `medico@teste.com`
   - **Senha**: `senha123`
3. Copie o `token` retornado na resposta.
4. Clique no botão **Authorize** (cadeado verde) no topo da página.
5. Cole o token no campo value e clique em **Authorize**.

Agora você pode testar todos os endpoints protegidos (`/patients`, `/appointments`) diretamente pelo navegador!

---

## 🧪 Testes e Qualidade

### Testes Automatizados (Jest)
Para rodar a suíte de testes (que utiliza um repositório em memória para rapidez e isolamento):

```bash
npm test
```

### Linting (ESLint)
Para verificar a qualidade do código e padrões de estilo:

```bash
npm run lint
```

*Nota: O projeto possui **Husky** configurado para rodar o lint automaticamente nos arquivos modificados antes de cada commit, garantindo que nenhum código fora do padrão seja commitado.*

---

## 📂 Estrutura de Pastas

```
src/
├── @types/         # Definições de tipos globais (ex: Express Request)
├── controllers/    # Controladores da API (recebem req/res)
├── dtos/           # Schemas de validação Zod (Data Transfer Objects)
├── middlewares/    # Middlewares (Auth, etc)
├── repositories/   # Camada de acesso a dados (Prisma e Interfaces)
│   └── interfaces/ # Interfaces para DIP (IPatientRepository)
├── routes/         # Definição de rotas e Injeção de Dependências
├── services/       # Regras de negócio (casos de uso)
├── utils/          # Utilitários (cliente Prisma singleton)
└── server.ts       # Entry point
```
