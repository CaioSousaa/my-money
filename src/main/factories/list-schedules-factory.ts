import { ListSchedules } from '../../usecases/usecases-schedule/list-schedules/list-schedules';
import { ListSchedulesController } from '../../adapters/presentation/controllers/list-schedules/list-schedules-controller';
import { MongooseScheduleRepository } from '../../external/repositories/schedule-repository/mongoose-schedule-repository';

export function listSchedulesFactory(): ListSchedulesController {
  const scheduleRepository = new MongooseScheduleRepository();
  const listSchedules = new ListSchedules(scheduleRepository);
  return new ListSchedulesController(listSchedules);
}
