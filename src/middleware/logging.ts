import logger from '../lib/logger';
import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  const { method, originalUrl, body, query, params } = req;
  res.on('finish', () => {
    const { statusCode } = res;
    if (statusCode > 499) {
      logger.error(`Server Error: ${method} ${originalUrl}`, {
        body,
        query,
        params,
        statusCode,
      });
    } else if (statusCode > 399) {
      logger.warn(`Client Error: ${method} ${originalUrl}`, {
        body,
        query,
        params,
        statusCode,
      });
    } else {
      logger.http(`${method} ${originalUrl}`, {
        body,
        query,
        params,
        statusCode,
      });
    }
  });
  next();
};