import { AuthenticateUser } from '../../usecases/usecases-user/authenticate-user/authenticate-user';
import { AuthenticateUserController } from '../../adapters/presentation/controllers/authenticate-user/authenticate-user-controller';
import { MongooseUserRepository } from '../../external/repositories/user-repository/mongoose-user-repository';
import { BcryptHashProvider } from '../../external/providers/bcrypt-hash-provider';
import { JwtTokenProvider } from '../../external/providers/jwt-token-provider';

export function authenticateUserFactory(): AuthenticateUserController {
  const userRepository = new MongooseUserRepository();
  const hashProvider = new BcryptHashProvider();
  const tokenProvider = new JwtTokenProvider();
  const authenticateUser = new AuthenticateUser(userRepository, hashProvider, tokenProvider);
  return new AuthenticateUserController(authenticateUser);
}
