import { FindCompanyByUser } from '../../usecases/usecases-company/find-company-by-user/find-company-by-user';
import { FindCompanyByUserController } from '../../adapters/presentation/controllers/find-company-by-user/find-company-by-user-controller';
import { MongooseCompanyRepository } from '../../external/repositories/company-repository/mongoose-company-repository';

export function findCompanyByUserFactory(): FindCompanyByUserController {
  const companyRepository = new MongooseCompanyRepository();
  const findCompanyByUser = new FindCompanyByUser(companyRepository);
  return new FindCompanyByUserController(findCompanyByUser);
}
