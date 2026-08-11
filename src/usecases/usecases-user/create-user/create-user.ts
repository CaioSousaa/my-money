import { User } from '../../../domain/entities/user';
import { IUserRepository } from '../../ports/IUser-repository';
import { IHashProvider } from '../../ports/IHash-provider';
import { AppError } from '../../../adapters/errors/app-error';
import { CreateUserDTO } from './dto/create-user-dto';

const HASH_SALT_ROUNDS = 8;

export interface CreateUserOutput {
  id: string;
  nome: string;
  matricula: string;
  created_at: Date;
}

export class CreateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
  ) {}

  async execute({ nome, matricula, senha }: CreateUserDTO): Promise<CreateUserOutput> {
    if (!nome || !matricula || !senha) {
      throw new AppError('nome, matricula and senha are required', 400);
    }

    const existingUser = await this.userRepository.findByMatricula(matricula);
    if (existingUser) {
      throw new AppError('matricula already registered', 409);
    }

    const hashedSenha = await this.hashProvider.hash(senha);

    const user = User.create({ nome, matricula, senha: hashedSenha });
    const createdUser = await this.userRepository.create(user);

    return {
      id: createdUser.id as string,
      nome: createdUser.nome,
      matricula: createdUser.matricula,
      created_at: createdUser.created_at,
    };
  }
}
