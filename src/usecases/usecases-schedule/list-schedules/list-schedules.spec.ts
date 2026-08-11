import { ListSchedules } from './list-schedules';
import { InMemoryScheduleRepository } from '../in-memory/in-memory-schedule-repository';
import { Schedule } from '../../../domain/entities/schedule';

describe('ListSchedules', () => {
  function makeSut() {
    const scheduleRepository = new InMemoryScheduleRepository();
    const sut = new ListSchedules(scheduleRepository);
    return { sut, scheduleRepository };
  }

  it('should list only the schedules of the given user ordered by dia_cadastrado desc', async () => {
    const { sut, scheduleRepository } = makeSut();

    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-10'),
        horas_cadastradas_dia: 4,
      }),
    );
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-1',
        dia_cadastrado: new Date('2026-08-11'),
        horas_cadastradas_dia: 6,
      }),
    );
    await scheduleRepository.create(
      Schedule.create({
        user_id: 'user-2',
        dia_cadastrado: new Date('2026-08-12'),
        horas_cadastradas_dia: 8,
      }),
    );

    const output = await sut.execute('user-1');

    expect(output).toHaveLength(2);
    expect(output[0].dia_cadastrado).toEqual(new Date('2026-08-11'));
    expect(output[1].dia_cadastrado).toEqual(new Date('2026-08-10'));
    expect(output.every((item) => item.user_id === 'user-1')).toBe(true);
  });
});
