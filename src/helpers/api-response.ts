import httpStatus from 'http-status'
import { Response } from 'express'
import APIError from './api-error'

class APIResponse {
  public success(res: Response, message: string, result?: any) {
    return res.status(httpStatus.OK).json({
      status: 'success',
      statusCode: httpStatus.OK,
      data: result,
      message
    })
  }

  public error(error: any, res: Response) {
    let code = httpStatus.INTERNAL_SERVER_ERROR
    if (error instanceof APIError) {
      /** Detach correct error */
      const { statusCode, err, message } = error
      if (typeof statusCode === 'number') {
        code = statusCode
      } else if (typeof httpStatus[statusCode] === 'number') {
        code = httpStatus[statusCode]
      }
      return res.status(code).json({
        status: 'error',
        statusCode,
        err,
        message
      })
    }

    /** Handle normal error */
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      err: error
    })
  }
}

export default new APIResponse()
