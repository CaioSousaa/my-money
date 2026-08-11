import { Request, Response } from 'express';
import { ListSchedules } from '../../../../usecases/usecases-schedule/list-schedules/list-schedules';

export class ListSchedulesController {
  constructor(private readonly listSchedules: ListSchedules) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const user_id = request.user_id as string;

    const schedules = await this.listSchedules.execute(user_id);

    return response.status(200).json(schedules);
  }
}
