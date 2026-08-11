import { Request, Response } from 'express';
import { CreateSchedule } from '../../../../usecases/usecases-schedule/create-schedule/create-schedule';

export class CreateScheduleController {
  constructor(private readonly createSchedule: CreateSchedule) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { dia_cadastrado, horas_cadastradas_dia } = request.body;
    const user_id = request.user_id as string;

    const schedule = await this.createSchedule.execute({
      user_id,
      dia_cadastrado,
      horas_cadastradas_dia,
    });

    return response.status(201).json(schedule);
  }
}
