import { Request, Response } from 'express';
import { FindCompanyByUser } from '../../../../usecases/usecases-company/find-company-by-user/find-company-by-user';

export class FindCompanyByUserController {
  constructor(private readonly findCompanyByUser: FindCompanyByUser) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const user_id = request.user_id as string;

    const company = await this.findCompanyByUser.execute(user_id);

    return response.status(200).json(company);
  }
}
