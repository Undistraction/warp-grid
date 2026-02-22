export class ValidationError extends Error {
  constructor(message = `A validation error occurred`) {
    super(message)
    this.name = `ValidationError`
    this.message = message
  }
}
