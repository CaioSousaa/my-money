import { Company } from '../../../domain/entities/company';
import { ICompanyRepository } from '../../ports/ICompany-repository';
import { AppError } from '../../../adapters/errors/app-error';
import { CreateCompanyDTO } from './dto/create-company-dto';

export interface CreateCompanyOutput {
  id: string;
  user_id: string;
  nome_empresa: string;
  observacoes?: string;
  transporte: boolean;
  created_at: Date;
}

export class CreateCompany {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute({
    user_id,
    nome_empresa,
    observacoes,
    transporte,
  }: CreateCompanyDTO): Promise<CreateCompanyOutput> {
    if (!nome_empresa) {
      throw new AppError('nome_empresa is required', 400);
    }

    const existingCompany = await this.companyRepository.findByUserId(user_id);
    if (existingCompany) {
      throw new AppError('user already has a company registered', 409);
    }

    const company = Company.create({ user_id, nome_empresa, observacoes, transporte });
    const createdCompany = await this.companyRepository.create(company);

    return {
      id: createdCompany.id as string,
      user_id: createdCompany.user_id,
      nome_empresa: createdCompany.nome_empresa,
      observacoes: createdCompany.observacoes,
      transporte: createdCompany.transporte,
      created_at: createdCompany.created_at,
    };
  }
}
