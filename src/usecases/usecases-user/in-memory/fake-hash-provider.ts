import { IHashProvider } from '../../ports/IHash-provider';

export class FakeHashProvider implements IHashProvider {
  async hash(payload: string): Promise<string> {
    return `hashed-${payload}`;
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return `hashed-${payload}` === hashed;
  }
}
