/**
 * This file is NOT exported and only used
 * for testing.
 */

import * as express from 'express';
import * as logur from '../src';
import { createServer, Server } from 'http';
import * as bodyParser from 'body-parser';

let app: express.Application = express();
let server: Server;
const log = logur.get();

// Just stores temp values for testing.
const cache: any = {

  // Stores test post value.
  post: '',

  // Dummy records for testing
  // query.
  query: [
    { timestamp: '2017-05-28T18:04:24.254Z', level: 'info', message: 'one' },
    { timestamp: '2017-05-29T18:04:24.254Z', level: 'info', message: 'two' },
    { timestamp: '2017-05-30T18:04:24.254Z', level: 'info', message: 'three' },
    { timestamp: '2017-05-30T18:04:24.254Z', level: 'info', message: 'four' },
    { timestamp: '2017-05-31T18:04:24.254Z', level: 'info', message: 'five' },
    { timestamp: '2017-07-31T18:04:24.254Z', level: 'info', message: 'six' },
    { timestamp: '2017-07-31T18:04:24.254Z', level: 'info', message: 'seven' },
    { timestamp: '2017-08-31T18:04:24.254Z', level: 'info', message: 'eight' },
    { timestamp: '2017-09-31T18:04:24.254Z', level: 'info', message: 'nine' },
    { timestamp: '2017-09-31T18:04:24.254Z', level: 'info', message: 'ten' }
  ]

};

// Enable Http Transport
log.transports.add('http', { port: 3000 }, logur.HttpTransport);

app.use(log.middleware({ transports: 'memory' }).handler);
app.use(bodyParser.json());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('home');
});

app.get('/cached', (req: express.Request, res: express.Response) => {
  res.json(cache.post || '');
});

app.post('/log', (req: express.Request, res: express.Response) => {
  cache.post = req.body;
  res.send('posted');
});

app.get('/log', (req: express.Request, res: express.Response) => {
  res.json(JSON.stringify(cache.query));
});

server = createServer(app);

server.listen(3000, '127.0.0.1', () => {
  const host = server.address().address;
  const port = server.address().port;
  log.write('-- Spec server listening at %s:%s --\n', host, port);
});

export {
  app,
  log
};