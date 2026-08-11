import { IUserRepository } from '../../ports/IUser-repository';
import { IHashProvider } from '../../ports/IHash-provider';
import { ITokenProvider } from '../../ports/IToken-provider';
import { AppError } from '../../../adapters/errors/app-error';
import { AuthenticateUserDTO } from './dto/authenticate-user-dto';

export interface AuthenticateUserOutput {
  token: string;
  user: {
    id: string;
    nome: string;
    matricula: string;
  };
}

export class AuthenticateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute({ matricula, senha }: AuthenticateUserDTO): Promise<AuthenticateUserOutput> {
    if (!matricula || !senha) {
      throw new AppError('matricula and senha are required', 400);
    }

    const invalidCredentialsError = new AppError('matricula or password incorrect', 401);

    const user = await this.userRepository.findByMatricula(matricula);
    if (!user) {
      throw invalidCredentialsError;
    }

    const isSenhaValid = await this.hashProvider.compare(senha, user.senha);
    if (!isSenhaValid) {
      throw invalidCredentialsError;
    }

    const token = this.tokenProvider.sign(user.id as string);

    return {
      token,
      user: {
        id: user.id as string,
        nome: user.nome,
        matricula: user.matricula,
      },
    };
  }
}
