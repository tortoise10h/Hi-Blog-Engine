export default class ErrorHandler extends Error {
  statusCode: number
  message: string
  err: any

  constructor(statusCode: number, message: string, err?: any) {
    super()
    this.statusCode = statusCode
    this.message = message
    this.err = err
  }
}
