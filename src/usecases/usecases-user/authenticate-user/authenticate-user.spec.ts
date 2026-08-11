import { AuthenticateUser } from './authenticate-user';
import { CreateUser } from '../create-user/create-user';
import { InMemoryUserRepository } from '../in-memory/in-memory-user-repository';
import { FakeHashProvider } from '../in-memory/fake-hash-provider';
import { FakeTokenProvider } from '../in-memory/fake-token-provider';
import { AppError } from '../../../adapters/errors/app-error';

describe('AuthenticateUser', () => {
  function makeSut() {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const tokenProvider = new FakeTokenProvider();
    const createUser = new CreateUser(userRepository, hashProvider);
    const sut = new AuthenticateUser(userRepository, hashProvider, tokenProvider);
    return { sut, createUser, userRepository };
  }

  it('should authenticate with valid credentials and return a token', async () => {
    const { sut, createUser } = makeSut();
    const createdUser = await createUser.execute({
      nome: 'Caio',
      matricula: '2023001',
      senha: '123456',
    });

    const output = await sut.execute({ matricula: '2023001', senha: '123456' });

    expect(output.token).toBe(`token-for-${createdUser.id}`);
    expect(output.user).toEqual({
      id: createdUser.id,
      nome: 'Caio',
      matricula: '2023001',
    });
  });

  it('should throw 401 when matricula does not exist', async () => {
    const { sut } = makeSut();

    await expect(sut.execute({ matricula: 'nao-existe', senha: '123456' })).rejects.toEqual(
      new AppError('matricula or password incorrect', 401),
    );
  });

  it('should throw 401 when senha is wrong', async () => {
    const { sut, createUser } = makeSut();
    await createUser.execute({ nome: 'Caio', matricula: '2023001', senha: '123456' });

    await expect(sut.execute({ matricula: '2023001', senha: 'errada' })).rejects.toEqual(
      new AppError('matricula or password incorrect', 401),
    );
  });
});
