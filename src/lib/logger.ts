import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../logs');

// create logs directory if it does not exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

interface TimezoneMethods {
  date: string;
  time: string;
}

const timezone = (): TimezoneMethods => {
  return {
    date: new Date().toLocaleDateString('en-GB', {
      timeZone: 'Australia/Sydney',
    }),
    time: new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Australia/Sydney',
      hour12: false,
    }),
  };
};

const logger: winston.Logger = winston.createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'http',
  format: format.combine(
    format.timestamp({
      format: `${timezone().date} ${timezone().time}`,
    }),
    format.json(),
  ),
});

logger.add(
  new winston.transports.Console({
    level: 'silly',
    format: format.combine(
      format.cli(),
      format.timestamp({
        format: `${timezone().date} ${timezone().time}`,
      }),
      format.printf((info: winston.Logform.TransformableInfo): string => {
        return `${info.timestamp} ${info.level}: ${info.message.replace(
          'undefined',
          '',
        )}`;
      }),
    ),
  }),
);

// Only add transports for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new DailyRotateFile({
      filename: logsDir + '/api-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'debug',
      format: format.combine(
        format.timestamp({
          format: `${timezone().date} ${timezone().time}`,
        }),
        format.json(),
      ),
    }),
  );
}

export default logger;
