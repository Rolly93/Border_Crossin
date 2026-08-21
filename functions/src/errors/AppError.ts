export class AppError extends Error {
  constructor(public statusCode: number, mssg: string) {
    super(mssg);
    this.name
  }
}