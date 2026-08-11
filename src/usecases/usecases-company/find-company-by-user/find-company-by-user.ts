import { ICompanyRepository } from '../../ports/ICompany-repository';
import { AppError } from '../../../adapters/errors/app-error';

export interface FindCompanyByUserOutput {
  id: string;
  user_id: string;
  nome_empresa: string;
  observacoes?: string;
  transporte: boolean;
  created_at: Date;
}

export class FindCompanyByUser {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(user_id: string): Promise<FindCompanyByUserOutput> {
    const company = await this.companyRepository.findByUserId(user_id);
    if (!company) {
      throw new AppError('company not found', 404);
    }

    return {
      id: company.id as string,
      user_id: company.user_id,
      nome_empresa: company.nome_empresa,
      observacoes: company.observacoes,
      transporte: company.transporte,
      created_at: company.created_at,
    };
  }
}
