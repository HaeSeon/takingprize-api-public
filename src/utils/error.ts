import { Response } from "express"

export class HttpError extends Error {
  constructor(res: Response, code: number, message: string) {
    super(message)
    res.status(code).send(message)
  }
}
