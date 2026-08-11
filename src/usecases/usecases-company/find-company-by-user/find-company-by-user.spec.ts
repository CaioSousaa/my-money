import { FindCompanyByUser } from './find-company-by-user';
import { InMemoryCompanyRepository } from '../in-memory/in-memory-company-repository';
import { Company } from '../../../domain/entities/company';
import { AppError } from '../../../adapters/errors/app-error';

describe('FindCompanyByUser', () => {
  function makeSut() {
    const companyRepository = new InMemoryCompanyRepository();
    const sut = new FindCompanyByUser(companyRepository);
    return { sut, companyRepository };
  }

  it('should return the company of the user', async () => {
    const { sut, companyRepository } = makeSut();
    await companyRepository.create(
      Company.create({ user_id: 'user-1', nome_empresa: 'Acme', transporte: true }),
    );

    const output = await sut.execute('user-1');

    expect(output).toEqual({
      id: expect.any(String),
      user_id: 'user-1',
      nome_empresa: 'Acme',
      observacoes: undefined,
      transporte: true,
      created_at: expect.any(Date),
    });
  });

  it('should throw 404 when the user has no company', async () => {
    const { sut } = makeSut();

    await expect(sut.execute('user-1')).rejects.toEqual(new AppError('company not found', 404));
  });
});
