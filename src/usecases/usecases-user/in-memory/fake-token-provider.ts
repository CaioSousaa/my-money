import { ITokenProvider } from '../../ports/IToken-provider';

export class FakeTokenProvider implements ITokenProvider {
  sign(subject: string): string {
    return `token-for-${subject}`;
  }

  verify(token: string): string {
    return token.replace('token-for-', '');
  }
}
