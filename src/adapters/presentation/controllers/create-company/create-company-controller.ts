import { Request, Response } from 'express';
import { CreateCompany } from '../../../../usecases/usecases-company/create-company/create-company';

export class CreateCompanyController {
  constructor(private readonly createCompany: CreateCompany) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { nome_empresa, observacoes, transporte } = request.body;
    const user_id = request.user_id as string;

    const company = await this.createCompany.execute({
      user_id,
      nome_empresa,
      observacoes,
      transporte,
    });

    return response.status(201).json(company);
  }
}
