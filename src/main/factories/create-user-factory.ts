import { CreateUser } from '../../usecases/usecases-user/create-user/create-user';
import { CreateUserController } from '../../adapters/presentation/controllers/create-user/create-user-controller';
import { MongooseUserRepository } from '../../external/repositories/user-repository/mongoose-user-repository';
import { BcryptHashProvider } from '../../external/providers/bcrypt-hash-provider';

export function createUserFactory(): CreateUserController {
  const userRepository = new MongooseUserRepository();
  const hashProvider = new BcryptHashProvider();
  const createUser = new CreateUser(userRepository, hashProvider);
  return new CreateUserController(createUser);
}
