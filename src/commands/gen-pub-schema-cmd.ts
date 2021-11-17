import path from 'path';
import {Argv} from 'yargs';
import {WriteContentToFile} from '../helpers';
import {getPublishedNodesSchema, NodeIdFormat} from '../publishednodes';
import fs from 'fs';
import winston from 'winston';

export interface GenPubSchemaArguments {
  directory: string;
  name: string;
  generateValueValidation: boolean;
  validateOptions: NodeIdFormat[];
  useSecurity: boolean;
  requireUseSecurity: boolean;
}

exports.command = ['generate-publishednodes-schema', 'gps'];
exports.describe =
  "generate json-schema file to use in validating the Azure OPC Publisher's" +
  "'publishednodes.json', or 'telemetryconfiguration' files.";

exports.builder = (yargs: Argv<GenPubSchemaArguments>) =>
  yargs
    .option('directory', {
      type: 'string',
      alias: ['d'],
      nargs: 1,
      describe: 'Folder location of schema output file.',
      default: 'output',
      normalize: true,
    })
    .option('name', {
      type: 'string',
      alias: ['n'],
      nargs: 1,
      describe: 'Output schema file name.',
      default: 'publishednodes-schema.json',
    })
    .option('gen-value-validation', {
      type: 'boolean',
      alias: ['gvv'],
      describe:
        'Determines if object value validation should be included in generated schema.' +
        'This applies to ExpandedNodeId and Id fields of items in the OpcNodes array.',
      default: false,
    })
    .option('validate-options', {
      choices: Object.keys(NodeIdFormat) as NodeIdFormat[],
      type: 'array',
      alias: ['v', 'vo'],
      default: ['ExpandedNodeId', 'NodeId', 'NamespaceIndex'],
      describe: 'OPC UA NodeId format to validate.',
      nargs: NaN,
      requiresArg: true,
    })
    .option('use-security', {
      type: 'boolean',
      // define both a single letter and multi-letter alias as
      // yargs appears to have issues setting the argsv values
      // when there is just a multi-letter alias.
      alias: ['u', 'us'],
      default: false,
      describe:
        'When the require-use-security flag is set to (true), this setting' +
        'will govern property value evaluation for the config file, default: (true)' +
        'e.g. ensuring that each config section has set `UseSecurity: true`',
    })
    .option('require-use-security', {
      type: 'boolean',
      // define both a single letter and multi-letter alias as
      // yargs appears to have issues setting the argsv values
      // when there is just a multi-letter alias.
      alias: ['r', 'rus'],
      default: false,
      describe:
        "Sets whether 'UseSecurity' is a required field for the schema, which" +
        'can be useful for template generation from the schema',
    });

exports.handler = function (
  argv: GenPubSchemaArguments,
  logger: winston.Logger
) {
  const SCHEMA_DIRECTORY = path.join('.', argv.directory);

  // Create the output directory if it does not exist
  if (!fs.existsSync(SCHEMA_DIRECTORY)) {
    try {
      logger.info('Creating schema output directory.');
      fs.mkdirSync(SCHEMA_DIRECTORY, {recursive: true});
    } catch (err) {
      logger.error(
        `Failed creating output schema directory with error: ${(err as Error).message
        }`
      );
      throw err;
    }
  }

  const schemaFileName = path.join(`${SCHEMA_DIRECTORY}`, argv.name);
  // inplement sort on the node id formats to make the output
  // more consistent. This does not impact tests or how the
  // order was supplied on the command line.
  const nodeIdFormats = argv.validateOptions.sort();
  let schema = '';
  try {
    schema = JSON.stringify(
      getPublishedNodesSchema(
        argv.generateValueValidation,
        nodeIdFormats,
        argv.useSecurity,
        argv.requireUseSecurity
      ),
      null,
      '\t'
    );
  } catch (err) {
    logger.error(
      `Failed generating schema with error: ${(err as Error).message}`
    );
  }
  logger.info(
    'Generated Schema file for publishednode.json, writing file out.'
  );
  // Output the generated schema to the file system
  // error handling is embedded in the follow function
  WriteContentToFile(schemaFileName, schema, logger);
};
