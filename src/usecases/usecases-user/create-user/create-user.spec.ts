import { CreateUser } from './create-user';
import { InMemoryUserRepository } from '../in-memory/in-memory-user-repository';
import { FakeHashProvider } from '../in-memory/fake-hash-provider';
import { AppError } from '../../../adapters/errors/app-error';

describe('CreateUser', () => {
  function makeSut() {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const sut = new CreateUser(userRepository, hashProvider);
    return { sut, userRepository, hashProvider };
  }

  it('should create a user with hashed senha', async () => {
    const { sut, userRepository } = makeSut();

    const output = await sut.execute({ nome: 'Caio', matricula: '2023001', senha: '123456' });

    expect(output).toEqual({
      id: expect.any(String),
      nome: 'Caio',
      matricula: '2023001',
      created_at: expect.any(Date),
    });
    expect(userRepository.users[0].senha).toBe('hashed-123456');
  });

  it('should throw 409 when matricula already exists', async () => {
    const { sut } = makeSut();

    await sut.execute({ nome: 'Caio', matricula: '2023001', senha: '123456' });

    await expect(
      sut.execute({ nome: 'Outro', matricula: '2023001', senha: 'abcdef' }),
    ).rejects.toEqual(new AppError('matricula already registered', 409));
  });

  it('should throw 400 when a required field is missing', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({ nome: '', matricula: '2023001', senha: '123456' }),
    ).rejects.toEqual(new AppError('nome, matricula and senha are required', 400));
  });
});
