import './config/dotenv';
import { env } from './config/dotenv';
import { connectMongo } from '../external/mongo/connection';
import { buildApp } from './config/app';

async function bootstrap(): Promise<void> {
  try {
    await connectMongo();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  const app = buildApp();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap();
