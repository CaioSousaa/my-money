# Templates por camada

Exemplos mínimos para copiar e adaptar. Substitua `Recurso`/`recurso` e `Acao`/`acao`.

## 1. Entidade de domínio — `src/domain/entities/recurso.ts`

```ts
export class Recurso {
  id?: string;
  nome: string;
  created_at: Date;

  constructor({ nome, created_at }: Recurso) {
    Object.assign(this, { nome, created_at });
  }

  static create({ nome }: Recurso) {
    return new Recurso({ nome, created_at: new Date() } as Recurso);
  }
}
```

## 2. Porta — `src/usecases/ports/IRecurso-repository.ts`

```ts
import { Recurso } from "../../domain/entities/recurso";

export interface IRecursoRepository {
  create(recurso: Recurso): Promise<Recurso>;
  findById(id: string): Promise<Recurso>;
}
```

## 3. DTO — `src/usecases/usecases-recurso/create-recurso/dto/create-recurso-dto.ts`

```ts
export class CreateRecursoDTO {
  nome: string;
}
```

## 4. Caso de uso — `src/usecases/usecases-recurso/create-recurso/create-recurso.ts`

```ts
import { AppError } from "../../../adapters/errors/app-error";
import { Recurso } from "../../../domain/entities/recurso";
import { IRecursoRepository } from "../../ports/IRecurso-repository";
import { CreateRecursoDTO } from "./dto/create-recurso-dto";

export class CreateRecurso {
  constructor(private recursoRepository: IRecursoRepository) {}

  async execute({ nome }: CreateRecursoDTO) {
    if (!nome) {
      throw new AppError("nome is required", 400);
    }

    const recurso = Recurso.create({ nome } as Recurso);

    return this.recursoRepository.create(recurso);
  }
}
```

## 5. Fake — `src/usecases/usecases-recurso/in-memory/in-memory-recurso-repository.ts`

```ts
import { v4 as uuid } from "uuid";
import { Recurso } from "../../../domain/entities/recurso";
import { IRecursoRepository } from "../../ports/IRecurso-repository";

export class InMemoryRecursoRepository implements IRecursoRepository {
  private recursos: Recurso[] = [];

  async create(recurso: Recurso): Promise<Recurso> {
    Object.assign(recurso, { id: uuid() });
    this.recursos.push(recurso);
    return recurso;
  }

  async findById(id: string): Promise<Recurso> {
    return this.recursos.find((r) => r.id === id);
  }
}
```

## 6. Teste — `src/usecases/usecases-recurso/create-recurso/create-recurso.spec.ts`

```ts
import { CreateRecurso } from "./create-recurso";
import { InMemoryRecursoRepository } from "../in-memory/in-memory-recurso-repository";

describe("create-recurso", () => {
  let repository: InMemoryRecursoRepository;
  let createRecurso: CreateRecurso;

  beforeEach(() => {
    repository = new InMemoryRecursoRepository();
    createRecurso = new CreateRecurso(repository);
  });

  it("should create a recurso with valid data", async () => {
    const recurso = await createRecurso.execute({ nome: "teste" });

    expect(recurso).toHaveProperty("id");
    expect(recurso.nome).toBe("teste");
  });

  it("should not create a recurso without nome", async () => {
    await expect(createRecurso.execute({ nome: "" })).rejects.toEqual({
      description: "nome is required",
      statusCode: 400,
    });
  });
});
```

## 7. Entidade do banco — `src/infra/db/entities/recurso/recurso-entity-db.ts`

```ts
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("recurso")
export class RecursoEntityDb extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column("date")
  created_at: Date;
}
```

Registre a classe em `entities` e a migration em `migrations` no `src/external/postgres/data-source.ts`.

## 8. Repositório concreto — `src/external/repositories/recurso-repository/typeOrm-recurso-repository.ts`

```ts
import { Recurso } from "../../../domain/entities/recurso";
import { IRecursoRepository } from "../../../usecases/ports/IRecurso-repository";
import { RecursoEntityDb } from "../../../infra/db/entities/recurso/recurso-entity-db";
import { AppDataSource } from "../../postgres/data-source";

export class TypeOrmRecursoRepository implements IRecursoRepository {
  async create({ nome }: Recurso): Promise<Recurso> {
    const recurso = AppDataSource.getRepository(RecursoEntityDb).create({
      nome,
      created_at: new Date(),
    });

    await AppDataSource.getRepository(RecursoEntityDb).save(recurso);

    return recurso;
  }

  async findById(id: string): Promise<Recurso> {
    return AppDataSource.getRepository(RecursoEntityDb).findOneBy({ id });
  }
}
```

## 9. Controller — `src/adapters/presentation/controllers/create-recurso/create-recurso-controller.ts`

```ts
import { Request, Response } from "express";
import { CreateRecurso } from "../../../../usecases/usecases-recurso/create-recurso/create-recurso";

export class CreateRecursoController {
  constructor(private createRecursoUseCase: CreateRecurso) {}

  async handle(req: Request, res: Response) {
    const { nome } = req.body;

    const recurso = await this.createRecursoUseCase.execute({ nome });

    res.status(201).json(recurso);
  }
}
```

## 10. Factory — `src/main/factories/create-recurso-factory.ts`

```ts
import { CreateRecursoController } from "../../adapters/presentation/controllers/create-recurso/create-recurso-controller";
import { TypeOrmRecursoRepository } from "../../external/repositories/recurso-repository/typeOrm-recurso-repository";
import { CreateRecurso } from "../../usecases/usecases-recurso/create-recurso/create-recurso";

export const createRecursoFactory = () => {
  const recursoRepository = new TypeOrmRecursoRepository();
  const createRecurso = new CreateRecurso(recursoRepository);

  return new CreateRecursoController(createRecurso);
};
```

## 11. Rota — `src/main/routes/recurso.routes.ts`

```ts
import { Router } from "express";
import { createRecursoFactory } from "../factories/create-recurso-factory";
import { ensureAuthenticated } from "../middleware/ensure-authenticate";

const recursoRoutes = Router();

recursoRoutes.post("/recurso", ensureAuthenticated, async (req, res) => {
  return createRecursoFactory().handle(req, res);
});

export { recursoRoutes };
```

Depois registre em `src/main/config/app.ts`: `app.use(recursoRoutes);`

## 12. Erro de aplicação — `src/adapters/errors/app-error.ts`

```ts
export class AppError {
  public readonly description: string;
  public readonly statusCode: number;

  constructor(description: string, statusCode = 400) {
    this.description = description;
    this.statusCode = statusCode;
  }
}
```

Middleware que traduz para HTTP — `src/main/middleware/initialization-error.ts`:

```ts
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../adapters/errors/app-error";

export function initializationError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.description });
  }

  return res.status(500).json({
    status: "error",
    message: `Internal server error: ${err.message}`,
  });
}
```
