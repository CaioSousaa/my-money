---
name: clean-architecture
description: Modela e implementa o back-end deste projeto seguindo Clean Architecture (Uncle Bob) com a estrutura de pastas de github.com/CaioSousaa/clean-architecture. Use sempre que for criar uma nova feature/caso de uso no back-end, criar entidade, repositório, controller, rota, factory ou teste; quando o usuário pedir para "modelar a arquitetura", "criar o caso de uso X", "adicionar endpoint", "criar entidade", "seguir arquitetura limpa", ou quando precisar decidir em qual camada um arquivo novo deve ficar.
---

# Clean Architecture — back-end

Guia de arquitetura para o back-end (Node + TypeScript + Express + TypeORM + Postgres + Jest).

## Regra de dependência

As dependências apontam **sempre para dentro**. Camada externa conhece a interna; a interna **nunca** conhece a externa.

```
external / infra / main   →   adapters   →   usecases   →   domain
```

Consequências práticas:

- `domain/entities` não importa nada de `usecases`, `adapters`, `infra`, `external`, nem de bibliotecas de framework (Express, TypeORM).
- `usecases` importa `domain` e as **portas** (`usecases/ports`), nunca uma implementação concreta de repositório.
- A inversão acontece pelas interfaces em `usecases/ports`: o caso de uso recebe `IUserRepository` no construtor; quem decide se é TypeORM ou in-memory é a factory em `main/factories`.
- `main` é a única camada que pode importar todas as outras — é onde a aplicação é montada.

## Estrutura de pastas

```
src/
├── domain/
│   └── entities/                  # entidades puras de negócio (user.ts, plans.ts)
├── usecases/
│   ├── ports/                     # interfaces de repositório (IUser-respository.ts)
│   ├── usecases-<contexto>/       # um diretório por contexto (usecases-user, ...)
│   │   ├── <acao>/                # um diretório por caso de uso
│   │   │   ├── <acao>.ts          # a classe do caso de uso
│   │   │   ├── <acao>.spec.ts     # teste do caso de uso
│   │   │   ├── dto/               # DTO de entrada
│   │   │   └── functions/         # funções auxiliares locais do caso de uso
│   │   └── in-memory/             # implementações fake das portas, para teste
├── adapters/
│   ├── errors/
│   │   └── app-error.ts           # erro de aplicação com statusCode
│   └── presentation/
│       └── controllers/
│           └── <acao>/
│               └── <acao>-controller.ts
├── external/
│   ├── postgres/data-source.ts    # DataSource do TypeORM
│   ├── repositories/
│   │   └── <recurso>-repository/
│   │       └── typeOrm-<recurso>-repository.ts
│   └── <servico-externo>/         # nodemailer, gateways de pagamento, etc.
├── infra/
│   └── db/
│       ├── entities/<recurso>/<recurso>-entity-db.ts   # entidade do ORM (@Entity)
│       └── migrations/<timestamp>-<Nome>.ts
└── main/
    ├── config/                    # app.ts, dotenv.ts, register-repository.ts
    ├── factories/                 # injeção de dependência manual
    ├── middleware/                # ensure-authenticate, tratamento de erro
    ├── routes/                    # <contexto>.routes.ts
    └── server.ts                  # bootstrap: DataSource + migrations + listen
```

### Distinção importante: entidade de domínio × entidade de banco

São dois arquivos diferentes, de propósito:

- `domain/entities/user.ts` — classe pura, com `static create()`, sem decorators.
- `infra/db/entities/user/user-entity-db.ts` — classe com `@Entity`, `@Column`, usada só pelo TypeORM.

O repositório em `external/` é quem traduz entre as duas.

## Convenções de nomes

| Item | Padrão | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `create-user.ts` |
| Portas | `I` + PascalCase, arquivo kebab | `IUserRepository` em `IUser-respository.ts` |
| Caso de uso | classe PascalCase, verbo + substantivo | `CreateUser` |
| Controller | sufixo `Controller` | `CreateUserController` |
| Repositório concreto | prefixo da tecnologia | `TypeOrmUserRepository` |
| Fake de teste | prefixo `InMemory` | `InMemoryUserRepository` |
| Factory | camelCase com sufixo `Factory` | `createUserFactory` |
| DTO | sufixo `DTO`, dentro de `dto/` | `CreateUserDTO` |
| Teste | `<mesmo-nome>.spec.ts`, ao lado do caso de uso | `create-user.spec.ts` |
| Entidade do ORM | sufixo `EntityDb` | `UserEntityDb` |
| Migration | `<timestamp>-<Nome>.ts` | `1725482215943-create-table-user.ts` |

## Fluxo para criar uma feature nova

Siga nesta ordem — de dentro para fora. Cada passo só depende dos anteriores.

1. **Entidade** em `domain/entities/<recurso>.ts`, se ainda não existir. Construtor com `Object.assign` e um `static create()` que preenche campos derivados (`created_at`, defaults).
2. **Porta** em `usecases/ports/I<Recurso>-repository.ts` — adicione só os métodos que o caso de uso realmente precisa.
3. **DTO** em `usecases/usecases-<contexto>/<acao>/dto/<acao>-dto.ts` com os campos de entrada.
4. **Caso de uso** em `usecases/usecases-<contexto>/<acao>/<acao>.ts`. Recebe a porta pelo construtor, valida as regras de negócio, lança `AppError` com o statusCode adequado. Validações reaproveitáveis vão em `functions/`.
5. **Fake** em `usecases/usecases-<contexto>/in-memory/in-memory-<recurso>-repository.ts` implementando a mesma porta.
6. **Teste** `<acao>.spec.ts` ao lado do caso de uso, usando o fake — nunca o banco real.
7. **Repositório concreto** em `external/repositories/<recurso>-repository/typeOrm-<recurso>-repository.ts`, implementando a porta. Se precisar de tabela nova: crie `infra/db/entities/...` e a migration, e registre ambas no `AppDataSource`.
8. **Controller** em `adapters/presentation/controllers/<acao>/<acao>-controller.ts` — só extrai `req.body`/`req.params`, chama `execute()` e devolve o status. Sem regra de negócio.
9. **Factory** em `main/factories/<acao>-factory.ts` ligando repositório concreto → caso de uso → controller.
10. **Rota** em `main/routes/<contexto>.routes.ts` chamando a factory. Registre o router em `main/config/app.ts` se for novo.

Templates de código prontos para cada passo: veja `references/templates.md`.

## Regras de camada

- Controller não contém regra de negócio, não fala com repositório, não conhece TypeORM.
- Caso de uso não conhece `Request`/`Response` do Express, não importa `typeorm`, não instancia repositório concreto.
- Entidade de domínio não tem decorator de ORM nem chamada de I/O.
- Repositório concreto não contém regra de negócio — só persistência e tradução entre entidade de domínio e entidade do banco.
- Nenhum `new TypeOrm...Repository()` fora de `main/factories` (ou de `main/config/register-repository.ts`, quando via tsyringe).
- Erros de negócio: `throw new AppError(mensagem, statusCode)`. O middleware `initializationError` converte para resposta HTTP.

## Testes

- Jest com preset `ts-jest`; `testMatch: ["**/**/*.spec.ts"]`.
- Testa-se o **caso de uso**, não o controller nem o repositório concreto.
- Use o fake in-memory ou `jest.Mocked<IRepositorio>` sobre ele.
- Cubra o caminho feliz e cada `AppError` que o caso de uso pode lançar, checando `{ description, statusCode }`.
- Rodar: `npm test`.

## Checklist de revisão

- [ ] Nenhum import de camada interna para camada externa
- [ ] Caso de uso depende de porta, não de implementação
- [ ] Existe fake in-memory para toda porta nova
- [ ] Caso de uso novo tem `.spec.ts` cobrindo sucesso e erros
- [ ] Controller magro (extrai, chama, responde)
- [ ] Entidade de domínio separada da entidade do ORM
- [ ] Tabela nova tem migration e está registrada no `AppDataSource`
- [ ] Rota registrada em `app.ts`
