import { Request, Response } from 'express';
import { GetEarnings } from '../../../../usecases/usecases-schedule/get-earnings/get-earnings';

export class GetEarningsController {
  constructor(private readonly getEarnings: GetEarnings) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const user_id = request.user_id as string;

    const earnings = await this.getEarnings.execute(user_id);

    return response.status(200).json(earnings);
  }
}
