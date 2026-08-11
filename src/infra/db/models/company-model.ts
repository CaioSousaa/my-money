import { Schema, model, Document, Types } from 'mongoose';

export interface CompanyDocument extends Document {
  user_id: Types.ObjectId;
  nome_empresa: string;
  observacoes?: string;
  transporte: boolean;
  created_at: Date;
}

const companySchema = new Schema<CompanyDocument>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  nome_empresa: { type: String, required: true },
  observacoes: { type: String },
  transporte: { type: Boolean, default: false },
  created_at: { type: Date, default: () => new Date() },
});

export const CompanyModel = model<CompanyDocument>('Company', companySchema);
