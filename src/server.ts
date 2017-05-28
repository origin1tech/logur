import * as express from 'express';
import * as logur from './';
import { createServer, Server } from 'http';
const log = logur.getDefault();

let app: express.Application = express();
let server: Server;

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('home');
});

app.get('/about', (req: express.Request, res: express.Response) => {
  res.send('about');
});

server = createServer(app);

server.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;
  log.write('Spec server listening at %s:%s', host, port);
});

