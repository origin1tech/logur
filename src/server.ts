import * as express from 'express';
import * as logur from '../src';

const log = logur.getDefault();

let app = express();

app.get('/', (req, res) => {
  res.send('home');
});

export let server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;
  log.write('Spec server listening at %s:%s', host, port).write();
});
