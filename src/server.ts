import * as express from 'express';
import * as logur from './';
import { createServer, Server } from 'http';
const log = logur.get();

let app: express.Application = express();
let server: Server;

app.use(log.middleware().handler);

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('home');
});

app.get('/error', (req: express.Request, res: express.Response, next: express.NextFunction) => {

  const err = new Error('just some error.');
  next(err);

});

app.use((err, req, re, next) => {
  console.log(err.message);
});


server = createServer(app);

server.listen(3000, '127.0.0.1', () => {
  const host = server.address().address;
  const port = server.address().port;
  log.write().write('-- Spec server listening at %s:%s --\n', host, port);
});

export {
  app
};