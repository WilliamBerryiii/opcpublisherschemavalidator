import {describe, it, beforeEach, afterEach} from 'mocha';
import {default as chai} from 'chai';
import {NodeIdFormat} from '../src/publishednodes';
import {createLogger, transports} from 'winston';
import sinon from 'sinon';
import yargs from 'yargs';

import fs from 'fs';
import path from 'path';
import {GenPubSchemaArguments} from '../src/commands/gen-pub-schema-cmd';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('The generate publishednodes schema command', () => {
  const LOGGER = createLogger({
    level: 'info',
    defaultMeta: {service: 'user-service'},
    transports: [
      // Write all logs with level `info` and below to `{app_name}.log`
      new transports.File({filename: 'unit_test.log'}),
    ],
  });
  const target = require(path.join(
    '..',
    'src',
    'commands',
    'gen-pub-schema-cmd'
  ));

  // ignore this any so we can do the partial
  // function application of the logger to the
  // command
  // eslint-disable-next-line
  let cmd: any;

  beforeEach(() => {
    cmd = {
      command: target.command,
      describe: target.describe,
      builder: target.builder,
      handler: () => {
        const partialfunc = cmd.handler;
        // wrap and inject logger
        // ignore this any so we can do the partial
        // function application of the logger to the
        // command
        // eslint-disable-next-line
        cmd.handler = (a: any) => {
          partialfunc(a, LOGGER);
        };
      },
    };
  });
  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  it('should return help output when the -h option is issued', () => {
    const parser = yargs.command(cmd).help();
    // Run the command module with --help as argument
    parser.parseSync(
      '--help',
      (err: unknown, _argv: GenPubSchemaArguments, output: string) => {
        expect(output).to.include(
          'generate-publishednodes-schema  generate json-schema file to use in'
        );
        expect(err).to.be.undefined;
      }
    );
  });

  it('should use sane defaults when run without parameters (using custom output folder for clean-up)', () => {
    const parser = yargs.command(cmd);
    parser.parseSync(
      'gps -d unit_test_output',
      (_err: unknown, argv: GenPubSchemaArguments) => {
        expect(argv.directory).to.equal('unit_test_output');
        expect(argv.name).to.equal('publishednodes-schema.json');
        expect(argv.useSecurity).to.equal(false);
        expect(argv.validateOptions).to.deep.equal([
          NodeIdFormat.ExpandedNodeId,
          NodeIdFormat.NodeId,
          NodeIdFormat.NamespaceIndex,
        ]);
        // remove generated test directory and files
        removeTestFiles(argv.directory);
      }
    );
  });

  it('should generate a schema file when supplied with an appropriate command', () => {
    const parser = yargs.command(cmd);
    parser.parseSync(
      'gps -d unit_test_output -n foo.json --no-us --no-rus -v ExpandedNodeId NodeId',
      (_err: unknown, argv: GenPubSchemaArguments) => {
        expect(argv.directory).to.equal('unit_test_output');
        expect(argv.name).to.equal('foo.json');
        expect(argv.useSecurity).to.equal(false);
        expect(argv.requireUseSecurity).to.equal(false);
        expect(argv.validateOptions).to.deep.equal([
          NodeIdFormat.ExpandedNodeId,
          NodeIdFormat.NodeId,
        ]);
        // remove generated test directory and files
        removeTestFiles(argv.directory);
      }
    );
  });

  it('should correctly set the UseSecurity field of the schema as a required value', () => {
    const parser = yargs.command(cmd);
    parser.parseSync(
      'gps -d unit_test_output -n foo.json -us -rus -v ExpandedNodeId NodeId',
      (_err: unknown, argv: GenPubSchemaArguments) => {
        expect(argv.directory).to.equal('unit_test_output');
        expect(argv.name).to.equal('foo.json');
        expect(argv.useSecurity).to.equal(true);
        expect(argv.requireUseSecurity).to.equal(true);
        expect(argv.validateOptions).to.deep.equal([
          NodeIdFormat.ExpandedNodeId,
          NodeIdFormat.NodeId,
        ]);
        // remove generated test directory and files
        removeTestFiles(argv.directory);
      }
    );
  });
});

function removeTestFiles(directory: string) {
  const cmdOutputDirectory = path.join(__dirname, '..', directory);
  if (fs.existsSync(cmdOutputDirectory)) {
    try {
      // console.log(`Removing temporary test file and directory: ${cmdOutputDirectory}`);
      fs.rmdirSync(cmdOutputDirectory, {recursive: true});
    } catch (err) {
      console.log(
        `Failed to remove test directory ${cmdOutputDirectory} with error: ${err}`
      );
    }
  }
}
