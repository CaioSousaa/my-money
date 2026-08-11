import bcrypt from 'bcrypt';
import { IHashProvider } from '../../usecases/ports/IHash-provider';

const SALT_ROUNDS = 8;

export class BcryptHashProvider implements IHashProvider {
  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, SALT_ROUNDS);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
