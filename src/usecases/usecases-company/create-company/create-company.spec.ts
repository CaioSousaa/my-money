import { CreateCompany } from './create-company';
import { InMemoryCompanyRepository } from '../in-memory/in-memory-company-repository';
import { AppError } from '../../../adapters/errors/app-error';

describe('CreateCompany', () => {
  function makeSut() {
    const companyRepository = new InMemoryCompanyRepository();
    const sut = new CreateCompany(companyRepository);
    return { sut, companyRepository };
  }

  it('should create a company for the user', async () => {
    const { sut } = makeSut();

    const output = await sut.execute({
      user_id: 'user-1',
      nome_empresa: 'Acme',
      observacoes: 'suporte ao time de dados',
      transporte: true,
    });

    expect(output).toEqual({
      id: expect.any(String),
      user_id: 'user-1',
      nome_empresa: 'Acme',
      observacoes: 'suporte ao time de dados',
      transporte: true,
      created_at: expect.any(Date),
    });
  });

  it('should default transporte to false', async () => {
    const { sut } = makeSut();

    const output = await sut.execute({ user_id: 'user-1', nome_empresa: 'Acme' });

    expect(output.transporte).toBe(false);
  });

  it('should throw 400 when nome_empresa is missing', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({ user_id: 'user-1', nome_empresa: '' }),
    ).rejects.toEqual(new AppError('nome_empresa is required', 400));
  });

  it('should throw 409 when user already has a company', async () => {
    const { sut } = makeSut();

    await sut.execute({ user_id: 'user-1', nome_empresa: 'Acme' });

    await expect(
      sut.execute({ user_id: 'user-1', nome_empresa: 'Other Co' }),
    ).rejects.toEqual(new AppError('user already has a company registered', 409));
  });
});
