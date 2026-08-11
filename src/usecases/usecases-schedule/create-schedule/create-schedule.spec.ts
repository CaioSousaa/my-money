import { CreateSchedule } from './create-schedule';
import { InMemoryScheduleRepository } from '../in-memory/in-memory-schedule-repository';
import { AppError } from '../../../adapters/errors/app-error';

describe('CreateSchedule', () => {
  function makeSut() {
    const scheduleRepository = new InMemoryScheduleRepository();
    const sut = new CreateSchedule(scheduleRepository);
    return { sut, scheduleRepository };
  }

  it('should create a schedule normalizing dia_cadastrado to the start of day', async () => {
    const { sut } = makeSut();

    const output = await sut.execute({
      user_id: 'user-1',
      dia_cadastrado: '2026-08-11T15:30:00.000Z',
      horas_cadastradas_dia: 6,
    });

    expect(output).toEqual({
      id: expect.any(String),
      user_id: 'user-1',
      dia_cadastrado: expect.any(Date),
      horas_cadastradas_dia: 6,
    });
  });

  it('should throw 400 when dia_cadastrado is missing or invalid', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({ user_id: 'user-1', dia_cadastrado: '', horas_cadastradas_dia: 6 }),
    ).rejects.toEqual(new AppError('dia_cadastrado is required and must be a valid date', 400));

    await expect(
      sut.execute({ user_id: 'user-1', dia_cadastrado: 'not-a-date', horas_cadastradas_dia: 6 }),
    ).rejects.toEqual(new AppError('dia_cadastrado is required and must be a valid date', 400));
  });

  it('should throw 400 when horas_cadastradas_dia is out of range', async () => {
    const { sut } = makeSut();

    await expect(
      sut.execute({ user_id: 'user-1', dia_cadastrado: '2026-08-11', horas_cadastradas_dia: 0 }),
    ).rejects.toEqual(
      new AppError('horas_cadastradas_dia must be greater than 0 and less than or equal to 24', 400),
    );

    await expect(
      sut.execute({ user_id: 'user-1', dia_cadastrado: '2026-08-11', horas_cadastradas_dia: 25 }),
    ).rejects.toEqual(
      new AppError('horas_cadastradas_dia must be greater than 0 and less than or equal to 24', 400),
    );
  });

  it('should throw 409 when the user already has a schedule for the same day', async () => {
    const { sut } = makeSut();

    await sut.execute({ user_id: 'user-1', dia_cadastrado: '2026-08-11', horas_cadastradas_dia: 6 });

    await expect(
      sut.execute({
        user_id: 'user-1',
        dia_cadastrado: '2026-08-11T20:00:00.000Z',
        horas_cadastradas_dia: 4,
      }),
    ).rejects.toEqual(new AppError('schedule already registered for this day', 409));
  });
});
