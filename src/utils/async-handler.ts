import { NextFunction, Request, RequestHandler, Response } from "express";

export interface AsyncRequestHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

export const asyncHandlerWrapper = (handler: AsyncRequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}