# API — my-money

Base URL: `http://localhost:<PORT>` (PORT do `.env`, default de dev geralmente `3333`/`3000`). Sem prefixo `/api`.

Content-Type: `application/json` em todo body.

## Autenticação

Rotas marcadas com 🔒 exigem header:

```
Authorization: Bearer <token>
```

Token obtido em `POST /login`. Ausência do header → `401 { "message": "token is missing" }`. Token inválido/expirado → `401 { "message": "invalid token" }`.

## Formato de erro

Erros de negócio (`AppError`):

```json
{ "message": "descrição do erro" }
```

Erro não tratado: `500 { "status": "error", "message": "Internal server error: ..." }`.

---

## POST /users

Cria usuário. Sem autenticação.

**Body**

| campo | tipo | obrigatório |
|---|---|---|
| nome | string | sim |
| matricula | string | sim |
| senha | string | sim |

```json
{ "nome": "Caio", "matricula": "12345", "senha": "minhasenha" }
```

**Respostas**
- `201` → `{ id, nome, matricula, created_at }`
- `400` — falta nome/matricula/senha
- `409` — matricula já cadastrada

---

## POST /login

Autentica usuário, devolve token JWT. Sem autenticação.

**Body**

| campo | tipo | obrigatório |
|---|---|---|
| matricula | string | sim |
| senha | string | sim |

```json
{ "matricula": "12345", "senha": "minhasenha" }
```

**Respostas**
- `200` → `{ token, user: { id, nome, matricula } }`
- `400` — falta matricula/senha
- `401` — matricula ou senha incorretos

---

## POST /company 🔒

Cria empresa vinculada ao usuário autenticado (`user_id` vem do token, não do body). Um usuário só pode ter uma empresa.

**Body**

| campo | tipo | obrigatório |
|---|---|---|
| nome_empresa | string | sim |
| observacoes | string | não |
| transporte | boolean | não (default `false`) |

```json
{ "nome_empresa": "Minha Empresa", "observacoes": "obs", "transporte": true }
```

**Respostas**
- `201` → `{ id, user_id, nome_empresa, observacoes, transporte, created_at }`
- `400` — falta nome_empresa
- `401` — sem token / token inválido
- `409` — usuário já tem empresa cadastrada

---

## GET /company 🔒

Busca empresa do usuário autenticado. Sem body/params — `user_id` vem do token.

**Respostas**
- `200` → `{ id, user_id, nome_empresa, observacoes, transporte, created_at }`
- `401` — sem token / token inválido
- `404` — empresa não encontrada

---

## POST /schedule 🔒

Cria registro de dia trabalhado.

**Body**

| campo | tipo | obrigatório | regra |
|---|---|---|---|
| dia_cadastrado | string (data, ex. `"2026-08-11"`) | sim | precisa ser data válida (`new Date(...)`) |
| horas_cadastradas_dia | number | sim | `> 0` e `<= 24` |

```json
{ "dia_cadastrado": "2026-08-11", "horas_cadastradas_dia": 8 }
```

Data é normalizada para início do dia em UTC. Um mesmo usuário não pode ter dois registros no mesmo dia.

**Respostas**
- `201` → `{ id, user_id, dia_cadastrado, horas_cadastradas_dia }`
- `400` — dia_cadastrado ausente/inválido, ou horas fora do intervalo
- `401` — sem token / token inválido
- `409` — já existe schedule pra esse dia

---

## GET /schedule 🔒

Lista todos schedules do usuário autenticado. Sem body/params.

**Respostas**
- `200` → array de `{ id, user_id, dia_cadastrado, horas_cadastradas_dia }`
- `401` — sem token / token inválido

---

## GET /earnings 🔒

Calcula ganhos do usuário a partir dos schedules + flag `transporte` da empresa. Sem body/params.

Regras de cálculo (`src/domain/entities/earnings-rates.ts`):
- `HOURLY_RATE = 5.33`
- `TRANSPORT_ALLOWANCE = 10.8` por dia (só se empresa tem `transporte: true`)

**Respostas**
- `200` →
```json
{
  "total_horas": 40,
  "total_dias": 5,
  "transporte": true,
  "valor_horas": 213.2,
  "valor_transporte": 54.0,
  "total": 267.2
}
```
- `401` — sem token / token inválido

---

## Resumo de rotas

| Método | Rota | Auth |
|---|---|---|
| POST | /users | não |
| POST | /login | não |
| POST | /company | sim |
| GET | /company | sim |
| POST | /schedule | sim |
| GET | /schedule | sim |
| GET | /earnings | sim |
