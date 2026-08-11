import { User } from '../../domain/entities/user';

export interface IUserRepository {
  findByMatricula(matricula: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
