import { randomUUID } from 'crypto';
import { Company } from '../../../domain/entities/company';
import { ICompanyRepository } from '../../ports/ICompany-repository';

export class InMemoryCompanyRepository implements ICompanyRepository {
  public companies: Company[] = [];

  async findByUserId(user_id: string): Promise<Company | null> {
    const company = this.companies.find((item) => item.user_id === user_id);
    return company ?? null;
  }

  async create(company: Company): Promise<Company> {
    company.id = company.id ?? randomUUID();
    this.companies.push(company);
    return company;
  }
}
