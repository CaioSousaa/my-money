import { IScheduleRepository } from '../../ports/ISchedule-repository';

export interface ListSchedulesOutput {
  id: string;
  user_id: string;
  dia_cadastrado: Date;
  horas_cadastradas_dia: number;
}

export class ListSchedules {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}

  async execute(user_id: string): Promise<ListSchedulesOutput[]> {
    const schedules = await this.scheduleRepository.listByUser(user_id);

    return schedules.map((schedule) => ({
      id: schedule.id as string,
      user_id: schedule.user_id,
      dia_cadastrado: schedule.dia_cadastrado,
      horas_cadastradas_dia: schedule.horas_cadastradas_dia,
    }));
  }
}
