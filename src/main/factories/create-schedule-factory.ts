import { CreateSchedule } from '../../usecases/usecases-schedule/create-schedule/create-schedule';
import { CreateScheduleController } from '../../adapters/presentation/controllers/create-schedule/create-schedule-controller';
import { MongooseScheduleRepository } from '../../external/repositories/schedule-repository/mongoose-schedule-repository';

export function createScheduleFactory(): CreateScheduleController {
  const scheduleRepository = new MongooseScheduleRepository();
  const createSchedule = new CreateSchedule(scheduleRepository);
  return new CreateScheduleController(createSchedule);
}
