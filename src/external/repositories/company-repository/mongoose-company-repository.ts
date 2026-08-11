import { Company } from '../../../domain/entities/company';
import { ICompanyRepository } from '../../../usecases/ports/ICompany-repository';
import { CompanyDocument, CompanyModel } from '../../../infra/db/models/company-model';

function toDomain(doc: CompanyDocument): Company {
  return Company.create({
    id: doc._id.toString(),
    user_id: doc.user_id.toString(),
    nome_empresa: doc.nome_empresa,
    observacoes: doc.observacoes,
    transporte: doc.transporte,
    created_at: doc.created_at,
  });
}

export class MongooseCompanyRepository implements ICompanyRepository {
  async findByUserId(user_id: string): Promise<Company | null> {
    const doc = await CompanyModel.findOne({ user_id });
    return doc ? toDomain(doc) : null;
  }

  async create(company: Company): Promise<Company> {
    const doc = await CompanyModel.create({
      user_id: company.user_id,
      nome_empresa: company.nome_empresa,
      observacoes: company.observacoes,
      transporte: company.transporte,
      created_at: company.created_at,
    });
    return toDomain(doc);
  }
}
