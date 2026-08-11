export class AppError {
  public readonly description: string;
  public readonly statusCode: number;

  constructor(description: string, statusCode = 400) {
    this.description = description;
    this.statusCode = statusCode;
  }
}
