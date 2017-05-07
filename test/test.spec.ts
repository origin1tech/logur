import * as chai from 'chai';
import * as mocha from 'mocha';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

import { getDefault, Logur, ILogur, LogurInstance, ILevelMethods, ConsoleTransport } from '../src';

// Instantiate Logur manually.
let logur = new Logur();

// Default Logur.
let log = getDefault();

// Create a custom transport.
log.transports.create('console2', ConsoleTransport);

describe('Logur:Main', () => {

  before((done) => {

    done();

  });

  it('should be an instance of Logur', () => {
    assert.instanceOf(logur, Logur);
  });

  it('should be an instance of LogurInstance', () => {
    assert.instanceOf(log, LogurInstance);
  });

  it('should be an instance of ConsoleTransport', () => {
    assert.instanceOf(log.transports.get('console2'), ConsoleTransport);
  });


});