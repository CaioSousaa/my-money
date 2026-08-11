export interface ITokenProvider {
  sign(subject: string): string;
  verify(token: string): string;
}
