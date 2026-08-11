import { GetEarnings } from '../../usecases/usecases-schedule/get-earnings/get-earnings';
import { GetEarningsController } from '../../adapters/presentation/controllers/get-earnings/get-earnings-controller';
import { MongooseScheduleRepository } from '../../external/repositories/schedule-repository/mongoose-schedule-repository';
import { MongooseCompanyRepository } from '../../external/repositories/company-repository/mongoose-company-repository';

export function getEarningsFactory(): GetEarningsController {
  const scheduleRepository = new MongooseScheduleRepository();
  const companyRepository = new MongooseCompanyRepository();
  const getEarnings = new GetEarnings(scheduleRepository, companyRepository);
  return new GetEarningsController(getEarnings);
}
