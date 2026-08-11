# SPEC — my-money (back-end)

## 1. Visão geral

API REST para estagiários/alunos registrarem as horas trabalhadas no dia e acompanharem quanto já ganharam. O aluno se cadastra, faz login, informa em qual empresa estagia (e se recebe auxílio transporte) e lança as horas por dia. A API calcula o total ganho.

## 2. Stack

| Item | Escolha |
|---|---|
| Runtime | Node.js |
| Linguagem | TypeScript |
| Framework HTTP | Express |
| Dev server | nodemon (+ ts-node) |
| Banco | MongoDB (Atlas) |
| ODM | Mongoose |
| Hash de senha | bcrypt |
| Autenticação | JWT (`jsonwebtoken`) |
| Testes | Jest + ts-jest |
| Config | dotenv |

O servidor deve imprimir uma mensagem de log ao subir, por exemplo:

```
🚀 Server running on http://localhost:3333
```

## 3. Regras de negócio

### 3.1 Cálculo de ganho

Constantes:

| Constante | Valor |
|---|---|
| `HOURLY_RATE` | `5.33` (por hora trabalhada) |
| `TRANSPORT_ALLOWANCE` | `10.80` (por dia trabalhado, apenas se a empresa do aluno tiver `transporte: true`) |

Fórmula por dia lançado:

```
ganho_do_dia = horas_cadastradas_dia * 5.33 + (transporte ? 10.80 : 0)
```

Total acumulado:

```
total = soma de ganho_do_dia de todos os lançamentos do aluno
```

O auxílio transporte é **por dia lançado**, não por hora. Se o aluno não tiver empresa cadastrada, considera-se `transporte: false`.

Valores monetários são retornados arredondados em 2 casas decimais.

### 3.2 Regras de cadastro/login

- `matricula` é única. Cadastro com matrícula já existente retorna `409`.
- Senha é gravada apenas como hash bcrypt (salt rounds `8`). A senha nunca volta em nenhuma resposta.
- Login compara a senha enviada com o hash via `bcrypt.compare`. Credencial inválida retorna `401` com mensagem genérica (`"matricula or password incorrect"`) — não revelar qual campo falhou.
- O JWT carrega `sub = user.id`, expira em `1d` e é assinado com `JWT_SECRET`.

### 3.3 Regras de agenda

- `horas_cadastradas_dia` deve ser `> 0` e `<= 24`.
- `dia_cadastrado` é uma data (sem hora relevante). Não pode haver dois lançamentos do mesmo aluno para o mesmo dia — o segundo retorna `409`.
- Um aluno só enxerga e altera os próprios lançamentos (filtro sempre por `user_id` extraído do token).

### 3.4 Regras de empresa

- Um aluno tem no máximo uma empresa ativa. Cadastrar uma segunda retorna `409` (a alteração é feita por update).

## 4. Modelo de dados

### 4.1 `users` (aluno)

| Campo | Tipo | Observação |
|---|---|---|
| `id` (`_id`) | ObjectId | PK |
| `nome` | string | obrigatório |
| `matricula` | string | obrigatório, único, indexado |
| `senha` | string | hash bcrypt, `select: false` |
| `created_at` | Date | default `new Date()` |

### 4.2 `companies` (empresa)

| Campo | Tipo | Observação |
|---|---|---|
| `id` (`_id`) | ObjectId | PK |
| `user_id` | ObjectId | ref `users`, indexado |
| `nome_empresa` | string | obrigatório |
| `observacoes` | string | o que o aluno faz na empresa |
| `transporte` | boolean | default `false` |
| `created_at` | Date | default `new Date()` |

### 4.3 `schedules` (agenda)

| Campo | Tipo | Observação |
|---|---|---|
| `id` (`_id`) | ObjectId | PK |
| `user_id` | ObjectId | ref `users`, indexado |
| `dia_cadastrado` | Date | obrigatório |
| `horas_cadastradas_dia` | number | `> 0` e `<= 24` |
| `created_at` | Date | default `new Date()` |

Índice composto único: `{ user_id: 1, dia_cadastrado: 1 }`.

## 5. Endpoints

Base: `/`. Todas as respostas em JSON. Rotas marcadas com 🔒 exigem header `Authorization: Bearer <token>`.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users` | — | Cadastro do aluno |
| POST | `/login` | — | Autenticação, devolve JWT |
| POST | `/company` | 🔒 | Cadastra a empresa do aluno |
| GET | `/company` | 🔒 | Retorna a empresa do aluno |
| POST | `/schedule` | 🔒 | Lança as horas de um dia |
| GET | `/schedule` | 🔒 | Lista os lançamentos do aluno |
| GET | `/earnings` | 🔒 | Total ganho pelo aluno |

### 5.1 `POST /users`

Request:

```json
{ "nome": "Caio", "matricula": "2023001", "senha": "123456" }
```

Response `201`:

```json
{ "id": "…", "nome": "Caio", "matricula": "2023001", "created_at": "2026-08-11T12:00:00.000Z" }
```

Erros: `400` campo obrigatório ausente · `409` matrícula já cadastrada.

### 5.2 `POST /login`

Request:

```json
{ "matricula": "2023001", "senha": "123456" }
```

Response `200`:

```json
{ "token": "eyJ…", "user": { "id": "…", "nome": "Caio", "matricula": "2023001" } }
```

Erros: `400` campo ausente · `401` credenciais inválidas.

### 5.3 `POST /company` 🔒

Request:

```json
{ "nome_empresa": "Acme", "observacoes": "suporte ao time de dados", "transporte": true }
```

Response `201`: objeto da empresa com `id` e `user_id`.

Erros: `400` `nome_empresa` ausente · `401` sem token · `409` aluno já possui empresa.

### 5.4 `GET /company` 🔒

Response `200`: objeto da empresa. `404` se não houver.

### 5.5 `POST /schedule` 🔒

Request:

```json
{ "dia_cadastrado": "2026-08-11", "horas_cadastradas_dia": 6 }
```

Response `201`:

```json
{
  "id": "…",
  "user_id": "…",
  "dia_cadastrado": "2026-08-11T00:00:00.000Z",
  "horas_cadastradas_dia": 6
}
```

Erros: `400` data ausente/inválida ou horas fora do intervalo `0 < h <= 24` · `401` sem token · `409` já existe lançamento nesse dia.

### 5.6 `GET /schedule` 🔒

Response `200`: lista de lançamentos do aluno, ordenada por `dia_cadastrado` decrescente.

### 5.7 `GET /earnings` 🔒

Response `200`:

```json
{
  "total_horas": 42,
  "total_dias": 7,
  "transporte": true,
  "valor_horas": 223.86,
  "valor_transporte": 75.6,
  "total": 299.46
}
```

Erros: `401` sem token.

## 6. Erros

Toda regra de negócio lança `AppError(description, statusCode)`. O middleware `initializationError` traduz para HTTP:

```json
{ "message": "matricula already registered" }
```

Erro não tratado vira `500`:

```json
{ "status": "error", "message": "Internal server error: …" }
```

## 7. Arquitetura

Clean Architecture conforme `.claude/skills/clean-architecture/SKILL.md`, com a camada de persistência trocada de TypeORM/Postgres para Mongoose/MongoDB. A regra de dependência é a mesma:

```
external / infra / main   →   adapters   →   usecases   →   domain
```

### 7.1 Estrutura de pastas

```
src/
├── domain/
│   └── entities/
│       ├── user.ts
│       ├── company.ts
│       └── schedule.ts
├── usecases/
│   ├── ports/
│   │   ├── IUser-repository.ts
│   │   ├── ICompany-repository.ts
│   │   ├── ISchedule-repository.ts
│   │   ├── IHash-provider.ts
│   │   └── IToken-provider.ts
│   ├── usecases-user/
│   │   ├── create-user/          # create-user.ts, .spec.ts, dto/
│   │   ├── authenticate-user/
│   │   └── in-memory/in-memory-user-repository.ts
│   ├── usecases-company/
│   │   ├── create-company/
│   │   ├── find-company-by-user/
│   │   └── in-memory/in-memory-company-repository.ts
│   └── usecases-schedule/
│       ├── create-schedule/
│       ├── list-schedules/
│       ├── get-earnings/         # + functions/calculate-earnings.ts
│       └── in-memory/in-memory-schedule-repository.ts
├── adapters/
│   ├── errors/app-error.ts
│   └── presentation/controllers/<acao>/<acao>-controller.ts
├── external/
│   ├── mongo/connection.ts        # mongoose.connect
│   ├── repositories/
│   │   ├── user-repository/mongoose-user-repository.ts
│   │   ├── company-repository/mongoose-company-repository.ts
│   │   └── schedule-repository/mongoose-schedule-repository.ts
│   └── providers/
│       ├── bcrypt-hash-provider.ts
│       └── jwt-token-provider.ts
├── infra/
│   └── db/models/
│       ├── user-model.ts
│       ├── company-model.ts
│       └── schedule-model.ts
└── main/
    ├── config/app.ts, dotenv.ts
    ├── factories/<acao>-factory.ts
    ├── middleware/ensure-authenticate.ts, initialization-error.ts
    ├── routes/user.routes.ts, company.routes.ts, schedule.routes.ts
    └── server.ts
```

### 7.2 Decisões de camada específicas deste projeto

- **bcrypt e jsonwebtoken não entram no caso de uso.** Ficam atrás das portas `IHashProvider` (`hash`, `compare`) e `ITokenProvider` (`sign`, `verify`), implementadas em `external/providers/`. Assim `create-user.spec.ts` e `authenticate-user.spec.ts` rodam com fakes, sem custo de bcrypt.
- **`domain/entities/user.ts` é classe pura**, sem `Schema` do Mongoose. O schema fica em `infra/db/models/user-model.ts`; o repositório em `external/` traduz `_id → id` entre os dois.
- **Constantes de valor** (`HOURLY_RATE`, `TRANSPORT_ALLOWANCE`) ficam no domínio, em `domain/entities/earnings-rates.ts` — não em variável de ambiente, pois são regra de negócio.
- **`ensure-authenticate`** valida o Bearer token e injeta `req.user_id`. Casos de uso recebem `user_id` como parâmetro; nunca leem `req`.
- Nenhum `new Mongoose*Repository()` fora de `main/factories`.

## 8. Configuração

`.env` (a partir de `atlas-credentials.env`):

```
PORT=3333
MONGODB_URI="mongodb+srv://caiothalles607_db_user:noSPMnAIEj3Gt3yF@cluster0.dwe8fkg.mongodb.net"
MONGODB_DB=my_money
JWT_SECRET=my-money-dev-secret
JWT_EXPIRES_IN=1d
```

Credenciais de teste — sem tratamento especial de segredo nesta fase. Ainda assim, `.env` fica no `.gitignore`.

### 8.1 Scripts npm

```json
{
  "dev": "nodemon src/main/server.ts",
  "build": "tsc",
  "start": "node dist/main/server.js",
  "test": "jest"
}
```

`nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/main/server.ts"
}
```

### 8.2 Bootstrap (`main/server.ts`)

1. carrega dotenv
2. conecta no MongoDB (`connectMongo()`)
3. `app.listen(PORT)` e log da mensagem de servidor rodando

Falha de conexão com o banco derruba o processo com log do erro.

## 9. Testes

- Um `.spec.ts` por caso de uso, ao lado dele, usando o fake in-memory da porta.
- Cobrir caminho feliz + cada `AppError` lançado (checando `{ description, statusCode }`).
- `get-earnings.spec.ts` deve cobrir explicitamente: sem lançamentos (`total = 0`), com transporte, sem transporte, e sem empresa cadastrada.

## 10. Rastreabilidade com `docs/PROGRESS.MD`

| Requisito | Caso de uso | Endpoint |
|---|---|---|
| Cadastro do aluno | `CreateUser` | `POST /users` |
| Login | `AuthenticateUser` | `POST /login` |
| Cadastrar empresa | `CreateCompany` | `POST /company` |
| Cadastrar horas do dia | `CreateSchedule` | `POST /schedule` |
| Ver quanto já ganhou | `GetEarnings` | `GET /earnings` |

## 11. Fora de escopo

Front-end, recuperação de senha, refresh token, edição/remoção de lançamentos, filtro de ganhos por mês, paginação, deploy e CI.

## 12. Fases de execução

Plano de implementação deste spec. Fundação e núcleo compartilhado primeiro (fases 0 e 1) e, depois, uma **fatia vertical por funcionalidade** (fases 2 a 5) — da entidade até a rota HTTP. Assim a stack completa (Mongo + JWT + Express) é validada já na fase 2, em vez de só no fim.

Legenda: `[ ]` pendente · `[x]` concluído.

### Fase 0 — Fundação do projeto

Repositório inicializado, TypeScript compilando e `npm run dev` subindo um Express vazio.

- [ ] `npm init -y` e configurar `package.json`
- [ ] Instalar dependências de runtime: `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, `dotenv`
- [ ] Instalar dependências de desenvolvimento: `typescript`, `ts-node`, `nodemon`, `jest`, `ts-jest`, `@types/node`, `@types/express`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/jest`
- [ ] `tsconfig.json` (`outDir: dist`, `rootDir: src`, `strict: true`, `esModuleInterop: true`, target ES2020+)
- [ ] `jest.config.js` com preset `ts-jest` e `testEnvironment: node`
- [ ] `nodemon.json` e scripts npm conforme a seção 8.1
- [ ] `.gitignore` (`node_modules`, `dist`, `.env`)
- [ ] `.env` a partir de `atlas-credentials.env` com as variáveis da seção 8
- [ ] Esqueleto de pastas de `src/` conforme a seção 7.1

**Aceite:** `npm run build` compila sem erro e `npm test` roda (mesmo sem testes).

### Fase 1 — Núcleo compartilhado

Peças usadas por todas as funcionalidades: erros, conexão com o banco, configuração do app e bootstrap.

- [ ] `adapters/errors/app-error.ts` — classe `AppError(description, statusCode)`
- [ ] `main/middleware/initialization-error.ts` — traduz `AppError` para HTTP e converte erro não tratado em `500` (seção 6)
- [ ] `main/config/dotenv.ts` — carrega e valida as variáveis de ambiente obrigatórias
- [ ] `external/mongo/connection.ts` — `connectMongo()` com `MONGODB_URI` e `MONGODB_DB`
- [ ] `main/config/app.ts` — Express, `express.json()` e registro do `initializationError` **depois** das rotas
- [ ] `main/server.ts` — bootstrap da seção 8.2

**Aceite:** `npm run dev` conecta no Atlas e imprime a mensagem de servidor rodando.

### Fase 2 — Fatia vertical: aluno (cadastro + login)

`POST /users` e `POST /login` ponta a ponta.

Domínio e portas:

- [ ] `domain/entities/user.ts` — classe pura, sem Mongoose
- [ ] `usecases/ports/IUser-repository.ts` — `findByMatricula`, `create`
- [ ] `usecases/ports/IHash-provider.ts` — `hash`, `compare`
- [ ] `usecases/ports/IToken-provider.ts` — `sign`, `verify`

Casos de uso (com fakes):

- [ ] `usecases-user/in-memory/in-memory-user-repository.ts`
- [ ] `create-user/create-user.ts` + `dto/` — `409` se a matrícula já existir; grava só o hash
- [ ] `create-user/create-user.spec.ts` — caminho feliz + matrícula duplicada + campo obrigatório ausente
- [ ] `authenticate-user/authenticate-user.ts` + `dto/` — `401` genérico para matrícula inexistente **e** senha errada; JWT conforme a seção 3.2
- [ ] `authenticate-user/authenticate-user.spec.ts` — caminho feliz + os dois casos de `401`

Infra e HTTP:

- [ ] `infra/db/models/user-model.ts` — `matricula` única e indexada, `senha` com `select: false`
- [ ] `external/repositories/user-repository/mongoose-user-repository.ts` — traduz `_id → id`
- [ ] `external/providers/bcrypt-hash-provider.ts` — salt rounds `8`
- [ ] `external/providers/jwt-token-provider.ts` — assina com `JWT_SECRET`
- [ ] Controllers e factories de `create-user` e `authenticate-user`
- [ ] `main/routes/user.routes.ts` — `POST /users` e `POST /login`; registrar no `app.ts`
- [ ] `main/middleware/ensure-authenticate.ts` — valida o Bearer token e injeta `req.user_id` (usado a partir da fase 3)

**Aceite:** cadastro devolve `201` sem o campo `senha`; matrícula repetida devolve `409`; login devolve `token` + `user`; credencial errada devolve `401`.

**PROGRESS.MD:** marcar cadastro e login.

### Fase 3 — Fatia vertical: empresa

`POST /company` e `GET /company`, já protegidos por token.

- [ ] `domain/entities/company.ts`
- [ ] `usecases/ports/ICompany-repository.ts` — `findByUserId`, `create`
- [ ] `usecases-company/in-memory/in-memory-company-repository.ts`
- [ ] `create-company/create-company.ts` + `.spec.ts` — `409` se o aluno já tiver empresa; `400` sem `nome_empresa`; `transporte` default `false`
- [ ] `find-company-by-user/find-company-by-user.ts` + `.spec.ts` — `404` quando não houver empresa
- [ ] `infra/db/models/company-model.ts` — `user_id` indexado
- [ ] `external/repositories/company-repository/mongoose-company-repository.ts`
- [ ] Controllers e factories das duas ações
- [ ] `main/routes/company.routes.ts` com `ensureAuthenticate`; registrar no `app.ts`

**Aceite:** sem token devolve `401`; segunda empresa devolve `409`; `GET` devolve a empresa do aluno do token e `404` quando não existir.

**PROGRESS.MD:** marcar cadastro da empresa.

### Fase 4 — Fatia vertical: agenda (horas do dia)

`POST /schedule` e `GET /schedule`.

- [ ] `domain/entities/schedule.ts`
- [ ] `usecases/ports/ISchedule-repository.ts` — `findByUserAndDay`, `create`, `listByUser`
- [ ] `usecases-schedule/in-memory/in-memory-schedule-repository.ts`
- [ ] `create-schedule/create-schedule.ts` + `.spec.ts` — valida `0 < horas <= 24` (`400`), data ausente/inválida (`400`) e dia duplicado do mesmo aluno (`409`); normaliza `dia_cadastrado` para o início do dia
- [ ] `list-schedules/list-schedules.ts` + `.spec.ts` — só os lançamentos do `user_id`, ordenados por `dia_cadastrado` decrescente
- [ ] `infra/db/models/schedule-model.ts` — índice composto único `{ user_id: 1, dia_cadastrado: 1 }`
- [ ] `external/repositories/schedule-repository/mongoose-schedule-repository.ts`
- [ ] Controllers e factories das duas ações
- [ ] `main/routes/schedule.routes.ts` com `ensureAuthenticate`; registrar no `app.ts`

**Aceite:** lançamento válido devolve `201`; repetir o mesmo dia devolve `409`; `0` ou `25` horas devolve `400`; a listagem nunca mostra lançamento de outro aluno.

**PROGRESS.MD:** marcar cadastro das horas do dia.

### Fase 5 — Ganhos

`GET /earnings` devolvendo o total acumulado.

- [ ] `domain/entities/earnings-rates.ts` — `HOURLY_RATE = 5.33`, `TRANSPORT_ALLOWANCE = 10.80`
- [ ] `usecases-schedule/get-earnings/functions/calculate-earnings.ts` — função pura; transporte por **dia** lançado, não por hora; arredondamento em 2 casas
- [ ] `get-earnings/get-earnings.ts` — combina os repositórios de agenda e empresa; sem empresa cadastrada, `transporte: false`
- [ ] `get-earnings/get-earnings.spec.ts` — sem lançamentos (`total = 0`), com transporte, sem transporte e sem empresa cadastrada (seção 9)
- [ ] Controller, factory e rota `GET /earnings` com `ensureAuthenticate`

**Aceite:** o payload traz `total_horas`, `total_dias`, `transporte`, `valor_horas`, `valor_transporte` e `total`, batendo com o exemplo da seção 5.7.

**PROGRESS.MD:** marcar "ver quanto já ganhei".

### Fase 6 — Fechamento

- [ ] Rodar a suíte completa: um `.spec.ts` por caso de uso, cobrindo caminho feliz + cada `AppError` (checando `{ description, statusCode }`)
- [ ] Conferir a regra de dependência: nada de `external`/`infra` importado por `usecases` ou `domain`; nenhum `new Mongoose*Repository()` fora de `main/factories`
- [ ] Testar os 7 endpoints manualmente (Insomnia/curl) contra o Atlas
- [ ] Confirmar que a senha não aparece em nenhuma resposta
- [ ] Conferir que `.env` está no `.gitignore` e não foi commitado
- [ ] `npm run build` + `npm start` rodando a partir de `dist/`
- [ ] Fechar todos os itens do `docs/PROGRESS.MD`
