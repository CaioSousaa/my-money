import { CreateCompany } from '../../usecases/usecases-company/create-company/create-company';
import { CreateCompanyController } from '../../adapters/presentation/controllers/create-company/create-company-controller';
import { MongooseCompanyRepository } from '../../external/repositories/company-repository/mongoose-company-repository';

export function createCompanyFactory(): CreateCompanyController {
  const companyRepository = new MongooseCompanyRepository();
  const createCompany = new CreateCompany(companyRepository);
  return new CreateCompanyController(createCompany);
}
