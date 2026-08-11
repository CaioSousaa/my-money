import { randomUUID } from 'crypto';
import { User } from '../../../domain/entities/user';
import { IUserRepository } from '../../ports/IUser-repository';

export class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findByMatricula(matricula: string): Promise<User | null> {
    const user = this.users.find((item) => item.matricula === matricula);
    return user ?? null;
  }

  async create(user: User): Promise<User> {
    user.id = user.id ?? randomUUID();
    this.users.push(user);
    return user;
  }
}
