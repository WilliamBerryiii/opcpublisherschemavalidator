import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path/posix';
import winston from 'winston';
import {Argv, exit} from 'yargs';

export interface ValidateSchemaArguments {
  type: string;
  schemaFile: string;
  configurationFile: string;
}

exports.command = ['validate', 'v'];
exports.desc = "Validate an Azure OPC Publisher's configuration file.";

exports.builder = (yargs: Argv) =>
  yargs
    .option('type', {
      type: 'string',
      choices: ['publishednodes', 'telemetry'],
      default: 'publishednodes',
      alias: ['t'],
      //nargs: 1,
      describe: 'Type of configuraiton file to validate',
      //requiresArg: true,
    })
    .option('schema-file', {
      type: 'string',
      alias: ['s', 'schema'],
      //nargs: 1,
      describe: 'Folder location of schema file to use for validation.',
      default: path.join('.', 'output', 'publishednodes-schema.json'),
      //requiresArg: true,
    })
    .option('configuration-file', {
      type: 'string',
      alias: ['cf', 'config-file'],
      //nargs: 1,
      describe: "Azure OPC Publisher's Configuration file to validate",
      default: path.join('.', 'sample_files', 'publishednodes.json'),
      //requiresArg: true,
    });

// eslint-disable-next-line
exports.handler = function (argv: ValidateSchemaArguments, logger: winston.Logger) {
  // do something with argv.
  logger.info(`Beginning schema validation on ${argv.configurationFile}`);

  let configFile: object = {};

  logger.info(`Reading in configuration file: ${argv.configurationFile}`);
  try {
    configFile = JSON.parse(fs.readFileSync(argv.configurationFile, 'utf-8'));
  } catch (err) {
    logger.error(
      `Failed reading configuration file with error: ${(err as Error).message}`
    );
  }

  logger.info(`Reading in schema file: ${argv.schemaFile}`);

  let schema: object = {};
  try {
    schema = JSON.parse(fs.readFileSync(argv.schemaFile, 'utf-8'));
  } catch (err) {
    logger.error(
      `Failed reading scheam file with error: ${(err as Error).message}`
    );
  }

  // validate config file
  try {
    const [result, validationErrors] = validateFile(configFile, schema);

    logger.info(`Configuration file validation result: ${result}`);
    if (!result) {
      //console.log('Found validation error. Publishing results to app log file.');
      logger.error(
        `Writing Validation Results for file ${argv.configurationFile}`
      );
      logger.error(validationErrors);
      //console.log('Validation results publised to app log.');
      exit(-1, new Error('File Validation Failed.'));
    }
  } catch (err) {
    logger.error(
      `Failed running configuration file validation with error: ${
        (err as Error).message
      }`
    );
  }
};

export function validateFile(configurationFile: object, schema: object) {
  const ajv = new Ajv({
    allErrors: true,
    strictTypes: false,
    strict: false,
    validateFormats: true,
    validateSchema: true,
  });
  addFormats(ajv);
  ajv.addVocabulary(['EndpointUrl', 'UseSecurity', 'OpcNodes', 'NodeId']);
  const validate = ajv.compile(schema);
  const result = validate(configurationFile);
  return [result, validate.errors];
}
