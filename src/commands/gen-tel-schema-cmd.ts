import fs from 'fs';
import path from 'path';
import winston from 'winston';
import {Argv} from 'yargs';

export interface GenTelSchemaArguments {
  directory: string;
  name: string;
}

exports.command = ['generate-telemetry-schema', 'gts'];
exports.desc =
  "generate json-schema file to use in validating the Azure OPC Publisher's 'publishednodes.json', or 'telemetryconfiguration' files.";

exports.builder = (yargs: Argv) =>
  yargs
    .option('directory', {
      type: 'string',
      alias: ['d'],
      nargs: 1,
      describe: 'Folder location of schema output file.',
      default: 'output',
    })
    .option('name', {
      type: 'string',
      alias: ['n'],
      nargs: 1,
      describe: 'Output schema file name.',
      default: 'publishednodes-schema.json',
    });

// eslint-disable-next-line
exports.handler = function (
  argv: GenTelSchemaArguments,
  logger: winston.Logger
) {
  const SCHEMA_DIRECTORY = path.join('.', argv.directory);

  // Create the output directory if it does not exist
  if (!fs.existsSync(SCHEMA_DIRECTORY)) {
    try {
      logger.info('Creating schema output directory.');
      fs.mkdirSync(SCHEMA_DIRECTORY, {recursive: true});
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  const schemaFileName = path.join(`${SCHEMA_DIRECTORY}`, argv.name);
  // inplement sort on the node id formats to make the output
  // more consistent. This does not impact tests or how the
  // // order was supplied on the command line.
  // const nodeIdFormats = argv.validateOptions.sort();
  // const schema = JSON.stringify(
  //   getPublishedNodesSchema(
  //     nodeIdFormats,
  //     argv.useSecurity,
  //     argv.requireUseSecurity
  //   ),
  //   null,
  //   '\t'
  // );
  // logger.info(
  //   'Generated Schema file for publishednode.json, writing file out.'
  // );
  // // Output the generated schema to the file system
  // WriteContentToFile(schemaFileName, schema, logger);
};
