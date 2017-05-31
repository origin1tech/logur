import * as chai from 'chai';
import * as mocha from 'mocha';
import * as fs from 'fs';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

import { get, Logur, ILogur, LogurInstance, ConsoleTransport, ILogurTransport, MemoryTransport, ILevelMethodsDefault, FileTransport } from '../src';

// Default Logur.
let log = get();
log.transports.add('memory', MemoryTransport);
log.transports.add('file', { json: false, pretty: false, filename: 'logs/app.log' }, FileTransport);

describe('Logur:Main', () => {

  before((done) => {

    // Delete log and seed so we always have test
    // log events with same dates for testing query etc.
    fs.unlinkSync('./logs/app.log');
    const seed = fs.readFileSync('./test/seed.log');
    fs.writeFileSync('./logs/app.log', seed, { flag: 'a' });
    done();

  });

  it('should be an instance of Logur', () => {
    assert.instanceOf(log._logur, Logur);
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

  it('should get Logur Output with message "log message"', (done) => {

    log.exec('memory', 'info', 'log message', (output) => {
      assert.equal('log message', output.message);
      done();
    });

  });

  it('should add a serializer where output serializers contains metadata.', (done) => {

    // Add a serializer for metadata.
    log.serializers.add('metadata', (data, options, output) => {
      data.test = 'testing';
      return data;
    });

    log.exec('memory', 'info', 'log message', (output) => {
      assert.isFunction(output.serializers.metadata);
      done();
    });


  });

  it('should remove serializer', () => {
    log.serializers.remove('metadata');
  });

  it('should get output using toMapped method returning mapped output', (done) => {

    log.exec('memory', 'info', 'log message', (output) => {

      const ts = output.timestamp;
      const mapped = output.toMapped().array;

      assert.deepEqual([ts, 'info', 'log message'], mapped);

      done();

    });

  });

  it('should log message and then callback', (done) => {
    log.exec('memory', 'info', 'log message', (output) => {
      assert.equal('log message', output.message);
      done();
    });
  });

  it('should on "logged" message emit Logur Output.', (done) => {
    log.on('logged', (output, instance) => {
      assert.equal(output.message, 'log message');
      done();
    });
    log.exec('memory', 'info', 'log message');
  });

  it('should update level in options cascading to transports.', () => {

    log.setOption('level', 3);
    const transport = log.transports.get<ILogurTransport>('console');
    assert.equal(3, transport.options.level);

  });

  it('should query File Transport', (done) => {
    // We'll just a use a known date that's in log file.
    const from = new Date('2017-05-31T21:35:21.174Z');
    let to = new Date('2017-05-31T21:39:05.043Z');
    log.query('file', { from: from, to: to, take: 5, skip: 0 }, (results) => {
      assert.equal(5, results.length);
      done();
    });
  });

});