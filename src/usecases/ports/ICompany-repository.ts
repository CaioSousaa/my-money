import { Company } from '../../domain/entities/company';

export interface ICompanyRepository {
  findByUserId(user_id: string): Promise<Company | null>;
  create(company: Company): Promise<Company>;
}
