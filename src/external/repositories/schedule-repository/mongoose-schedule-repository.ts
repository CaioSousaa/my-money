import { Schedule } from '../../../domain/entities/schedule';
import { IScheduleRepository } from '../../../usecases/ports/ISchedule-repository';
import { ScheduleDocument, ScheduleModel } from '../../../infra/db/models/schedule-model';

function toDomain(doc: ScheduleDocument): Schedule {
  return Schedule.create({
    id: doc._id.toString(),
    user_id: doc.user_id.toString(),
    dia_cadastrado: doc.dia_cadastrado,
    horas_cadastradas_dia: doc.horas_cadastradas_dia,
    created_at: doc.created_at,
  });
}

export class MongooseScheduleRepository implements IScheduleRepository {
  async findByUserAndDay(user_id: string, dia_cadastrado: Date): Promise<Schedule | null> {
    const doc = await ScheduleModel.findOne({ user_id, dia_cadastrado });
    return doc ? toDomain(doc) : null;
  }

  async create(schedule: Schedule): Promise<Schedule> {
    const doc = await ScheduleModel.create({
      user_id: schedule.user_id,
      dia_cadastrado: schedule.dia_cadastrado,
      horas_cadastradas_dia: schedule.horas_cadastradas_dia,
      created_at: schedule.created_at,
    });
    return toDomain(doc);
  }

  async listByUser(user_id: string): Promise<Schedule[]> {
    const docs = await ScheduleModel.find({ user_id }).sort({ dia_cadastrado: -1 });
    return docs.map(toDomain);
  }
}
