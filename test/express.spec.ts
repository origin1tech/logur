import * as chai from 'chai';
import * as mocha from 'mocha';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

import * as supertest from 'supertest';
import { app } from './server';

// Init supertest
const req = supertest(app);

describe('Logur:Express', () => {

  before((done) => {
    done();
  });

  it('should get home from server.', (done) => {
    req.get('/').expect('home', done);
  });

});