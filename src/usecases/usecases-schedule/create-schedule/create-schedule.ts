import { Schedule } from '../../../domain/entities/schedule';
import { IScheduleRepository } from '../../ports/ISchedule-repository';
import { AppError } from '../../../adapters/errors/app-error';
import { CreateScheduleDTO } from './dto/create-schedule-dto';

export interface CreateScheduleOutput {
  id: string;
  user_id: string;
  dia_cadastrado: Date;
  horas_cadastradas_dia: number;
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export class CreateSchedule {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}

  async execute({
    user_id,
    dia_cadastrado,
    horas_cadastradas_dia,
  }: CreateScheduleDTO): Promise<CreateScheduleOutput> {
    const parsedDate = dia_cadastrado ? new Date(dia_cadastrado) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      throw new AppError('dia_cadastrado is required and must be a valid date', 400);
    }

    if (!horas_cadastradas_dia || horas_cadastradas_dia <= 0 || horas_cadastradas_dia > 24) {
      throw new AppError(
        'horas_cadastradas_dia must be greater than 0 and less than or equal to 24',
        400,
      );
    }

    const normalizedDay = startOfDay(parsedDate);

    const existingSchedule = await this.scheduleRepository.findByUserAndDay(user_id, normalizedDay);
    if (existingSchedule) {
      throw new AppError('schedule already registered for this day', 409);
    }

    const schedule = Schedule.create({
      user_id,
      dia_cadastrado: normalizedDay,
      horas_cadastradas_dia,
    });
    const createdSchedule = await this.scheduleRepository.create(schedule);

    return {
      id: createdSchedule.id as string,
      user_id: createdSchedule.user_id,
      dia_cadastrado: createdSchedule.dia_cadastrado,
      horas_cadastradas_dia: createdSchedule.horas_cadastradas_dia,
    };
  }
}
