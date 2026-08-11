import { User } from '../../../domain/entities/user';
import { IUserRepository } from '../../../usecases/ports/IUser-repository';
import { UserDocument, UserModel } from '../../../infra/db/models/user-model';

function toDomain(doc: UserDocument): User {
  return User.create({
    id: doc._id.toString(),
    nome: doc.nome,
    matricula: doc.matricula,
    senha: doc.senha,
    created_at: doc.created_at,
  });
}

export class MongooseUserRepository implements IUserRepository {
  async findByMatricula(matricula: string): Promise<User | null> {
    const doc = await UserModel.findOne({ matricula }).select('+senha');
    return doc ? toDomain(doc) : null;
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      nome: user.nome,
      matricula: user.matricula,
      senha: user.senha,
      created_at: user.created_at,
    });
    return toDomain(doc);
  }
}
