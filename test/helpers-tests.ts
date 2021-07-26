import {describe, it, beforeEach, afterEach} from 'mocha';
import {default as chai} from 'chai';
import {default as sinon} from 'sinon';
import winston from 'winston';

const sandbox = sinon.createSandbox();
const expect = chai.expect;
const {createLogger} = winston;

describe('The empty test', () => {
  it('should return true', () => {
    expect(true).to.eql(true);
  });
});

describe('When running and empty test it', () => {
  const logger = createLogger();
  let stub: sinon.SinonStub<object[], winston.Logger> | undefined = undefined;
  beforeEach(() => {
    // stub out the `error` method
    stub = sandbox.stub(logger, 'error');
    stub = sandbox.stub(logger, 'info');
  });

  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  it('should return true', () => {
    logger.info('empty');
    expect(true).to.eql(true);
    // logger should only be called on error
    sinon.assert.calledOnce(stub!);
  });
});
