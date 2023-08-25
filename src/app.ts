import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv';
import logger from './lib/logger';
// import routes from './routes/index';
import { createTerminus } from '@godaddy/terminus';
// import logging from './middleware/logging';

dotenv.config();
const app = express();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(cors());
// NOTE: Currently liking morgan better
// TODO: Will implement some kind of adapter
// to pipe morgan logs into winston for purposes
// of managing log files.
// app.use(logging);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Hi There.',
  });
});

function onHealthCheck({ state }: { state: any }) {
  return Promise.resolve(
    // optionally include a resolve value to be included as
    // info in the health check response
    {
      status: state.isShuttingDown ? 'shutting_down' : 'up',
    },
  );
}

async function startServer(port: number, host: string): Promise<void> {
  const server = app.listen(port, host, async (): Promise<void> => {
    logger.info(`Running on http://${host}:${port}`);
  });

  createTerminus(server, {
    healthChecks: { '/healthcheck': onHealthCheck },
  });
}

export { startServer };
