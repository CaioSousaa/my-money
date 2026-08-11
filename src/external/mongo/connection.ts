import mongoose from 'mongoose';
import { env } from '../../main/config/dotenv';

export async function connectMongo(): Promise<typeof mongoose> {
  return mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB,
  });
}
