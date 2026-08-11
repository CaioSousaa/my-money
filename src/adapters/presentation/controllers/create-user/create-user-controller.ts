import { Request, Response } from 'express';
import { CreateUser } from '../../../../usecases/usecases-user/create-user/create-user';

export class CreateUserController {
  constructor(private readonly createUser: CreateUser) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { nome, matricula, senha } = request.body;

    const user = await this.createUser.execute({ nome, matricula, senha });

    return response.status(201).json(user);
  }
}
