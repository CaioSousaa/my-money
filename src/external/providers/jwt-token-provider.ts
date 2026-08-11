import jwt from 'jsonwebtoken';
import { ITokenProvider } from '../../usecases/ports/IToken-provider';
import { env } from '../../main/config/dotenv';

export class JwtTokenProvider implements ITokenProvider {
  sign(subject: string): string {
    return jwt.sign({}, env.JWT_SECRET, {
      subject,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): string {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return (decoded as jwt.JwtPayload).sub as string;
  }
}
