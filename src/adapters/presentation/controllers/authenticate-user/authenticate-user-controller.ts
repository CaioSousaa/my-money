import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../usecases/usecases-user/authenticate-user/authenticate-user';

export class AuthenticateUserController {
  constructor(private readonly authenticateUser: AuthenticateUser) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { matricula, senha } = request.body;

    const result = await this.authenticateUser.execute({ matricula, senha });

    return response.status(200).json(result);
  }
}
