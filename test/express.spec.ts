import * as chai from 'chai';
import * as mocha from 'mocha';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

import * as supertest from 'supertest';
import { app, log } from './server';

// Init supertest
const req = supertest(app);

describe('Logur:Express', () => {

  before((done) => {
    done();
  });

  it('should get home from server.', (done) => {
    req.get('/').expect('home', done);
  });

  it('should log and post via Http Transport', (done) => {
    const msg = 'test http transport.';
    log.using('http').info(msg, () => {
      req.get('/cached').expect(200).end((err, res) => {
        assert.equal(msg, res.body.message);
        done();
      });
    });
  });

  it('should query via Http Transport.', (done) => {
    // Really just testing Http Transport query the
    // server will just return dummy data up to user
    // to define how server side query parses data.
    log.query('http', { take: 10 }, (result) => {
      assert.equal(10, JSON.parse(result).length);
      done();
    });
  });

});