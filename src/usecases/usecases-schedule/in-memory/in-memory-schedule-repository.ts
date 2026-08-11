import { randomUUID } from 'crypto';
import { Schedule } from '../../../domain/entities/schedule';
import { IScheduleRepository } from '../../ports/ISchedule-repository';

export class InMemoryScheduleRepository implements IScheduleRepository {
  public schedules: Schedule[] = [];

  async findByUserAndDay(user_id: string, dia_cadastrado: Date): Promise<Schedule | null> {
    const schedule = this.schedules.find(
      (item) => item.user_id === user_id && item.dia_cadastrado.getTime() === dia_cadastrado.getTime(),
    );
    return schedule ?? null;
  }

  async create(schedule: Schedule): Promise<Schedule> {
    schedule.id = schedule.id ?? randomUUID();
    this.schedules.push(schedule);
    return schedule;
  }

  async listByUser(user_id: string): Promise<Schedule[]> {
    return this.schedules
      .filter((item) => item.user_id === user_id)
      .sort((a, b) => b.dia_cadastrado.getTime() - a.dia_cadastrado.getTime());
  }
}
