import { GetEarnings } from './get-earnings';
import { InMemoryScheduleRepository } from '../in-memory/in-memory-schedule-repository';
import { InMemoryCompanyRepository } from '../../usecases-company/in-memory/in-memory-company-repository';
import { Schedule } from '../../../domain/entities/schedule';
import { Company } from '../../../domain/entities/company';

describe('GetEarnings', () => {
  function makeSut() {
    const scheduleRepository = new InMemoryScheduleRepository();
    const companyRepository = new InMemoryCompanyRepository();
    const sut = new GetEarnings(scheduleRepository, companyRepository);
    return { sut, scheduleRepository, companyRepository };
  }

  it('should return zeroed totals when there are no schedules', async () => {
    const { sut } = makeSut();

    const output = await sut.execute('user-1');

    expect(output).toEqual({
      total_horas: 0,
      total_dias: 0,
      transporte: false,
      valor_horas: 0,
      valor_transporte: 0,
      total: 0,
    });
  });

  it('should include valor_transporte per day when the company has transporte', async () => {
    const { sut, scheduleRepository, companyRepository } = makeSut();
    await companyRepository.create(
      Company.create({ user_id: 'user-1', nome_empresa: 'Acme', transporte: true }),
    );
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-10'),
        horas_cadastradas_dia: 20,
      }),
    );
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-11'),
        horas_cadastradas_dia: 22,
      }),
    );

    const output = await sut.execute('user-1');

    expect(output).toEqual({
      total_horas: 42,
      total_dias: 2,
      transporte: true,
      valor_horas: 223.86,
      valor_transporte: 21.6,
      total: 245.46,
    });
  });

  it('should not add valor_transporte when the company has transporte false', async () => {
    const { sut, scheduleRepository, companyRepository } = makeSut();
    await companyRepository.create(
      Company.create({ user_id: 'user-1', nome_empresa: 'Acme', transporte: false }),
    );
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-10'),
        horas_cadastradas_dia: 10,
      }),
    );

    const output = await sut.execute('user-1');

    expect(output).toEqual({
      total_horas: 10,
      total_dias: 1,
      transporte: false,
      valor_horas: 53.3,
      valor_transporte: 0,
      total: 53.3,
    });
  });

  it('should default transporte to false when the user has no company registered', async () => {
    const { sut, scheduleRepository } = makeSut();
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-10'),
        horas_cadastradas_dia: 8,
      }),
    );

    const output = await sut.execute('user-1');

    expect(output.transporte).toBe(false);
    expect(output.valor_transporte).toBe(0);
    expect(output.total).toBe(output.valor_horas);
  });
});
