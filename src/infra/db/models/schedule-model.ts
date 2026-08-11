import { Schema, model, Document, Types } from 'mongoose';

export interface ScheduleDocument extends Document {
  user_id: Types.ObjectId;
  dia_cadastrado: Date;
  horas_cadastradas_dia: number;
  created_at: Date;
}

const scheduleSchema = new Schema<ScheduleDocument>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  dia_cadastrado: { type: Date, required: true },
  horas_cadastradas_dia: { type: Number, required: true },
  created_at: { type: Date, default: () => new Date() },
});

scheduleSchema.index({ user_id: 1, dia_cadastrado: 1 }, { unique: true });

export const ScheduleModel = model<ScheduleDocument>('Schedule', scheduleSchema);
