import { Schedule } from '../../domain/entities/schedule';

export interface IScheduleRepository {
  findByUserAndDay(user_id: string, dia_cadastrado: Date): Promise<Schedule | null>;
  create(schedule: Schedule): Promise<Schedule>;
  listByUser(user_id: string): Promise<Schedule[]>;
}
