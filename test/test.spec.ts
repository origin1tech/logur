import * as chai from 'chai';
import * as mocha from 'mocha';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

import { getDefault, Logur, ILogur, LogurInstance, ILevelMethods, ConsoleTransport, ILogurTransport } from '../src';

// Instantiate Logur manually.
let logur = new Logur();

// Default Logur.
let log = getDefault();

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

  it('should add a console transport.', () => {
    log.transports.add('console2', ConsoleTransport);
  });

  it('should be an instance of ConsoleTransport', () => {
    assert.instanceOf(log.transports.get('console2'), ConsoleTransport);
  });

  it('should remove a transport.', () => {
    log.transports.remove('console2');
  });

  it('should get Logur Output with message "log message"', () => {
    const output = log.logger([], 'info', 'log message');
    assert.equal('log message', output.message);
  });

  it('should add a serializer where output serializers contains metadata.', () => {

    // Add a serializer for metadata.
    log.serializers.add('metadata', (data, options, output) => {
      data.test = 'testing';
      return data;
    });

    const output = log.logger([], 'info', 'log message');
    assert.isFunction(output.serializers.metadata);

  });

  it('should remove serializer', () => {
    log.serializers.remove('metadata');
  });

  it('should get output using toMapped method returning mapped output', () => {

    let output = log.logger([], 'info', 'log message');
    const ts = output.timestamp;
    const mapped = output.toMapped().array;

    assert.deepEqual(['info', ts, 'log message'], mapped);

  });

  it('should log message and then callback', (done) => {
    log.logger([], 'info', 'log message', (output) => {
      assert.equal('log message', output.message);
      done();
    });
  });

  it('should on "logged" message emit Logur Output.', (done) => {
    log.on('logged', (output, instance) => {
      assert.equal(output.message, 'log message');
      done();
    });
    log.logger([], 'info', 'log message');
  });

  it('should update level in options cascading to transports.', () => {

    log.setOption('level', 3);
    const transport = log.transports.get<ILogurTransport>('console');
    assert.equal(3, transport.options.level);

  });

});