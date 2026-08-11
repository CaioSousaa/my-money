import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  nome: string;
  matricula: string;
  senha: string;
  created_at: Date;
}

const userSchema = new Schema<UserDocument>({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true, index: true },
  senha: { type: String, required: true, select: false },
  created_at: { type: Date, default: () => new Date() },
});

export const UserModel = model<UserDocument>('User', userSchema);
