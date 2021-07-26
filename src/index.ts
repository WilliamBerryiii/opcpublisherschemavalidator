import path from 'path';
import winston from 'winston';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

const APP_NAME = 'OPC Publisher Schema Validator';

/*
Build logger
*/
const {createLogger, format, transports} = winston;
const {combine, timestamp, printf, splat} = format;
const LOGGING_FORMATTER = printf(({level, message, timestamp}) => {
  const MSG = `${timestamp} [${level}] : ${message} `;
  return MSG;
});
const LOGGER = createLogger({
  level: 'info',
  format: combine(format.uncolorize(), splat(), timestamp(), LOGGING_FORMATTER),
  defaultMeta: {service: 'user-service'},
  transports: [
    // Write all logs with level `info` and below to `{app_name}.log`
    new transports.File({filename: `${APP_NAME}.log`}),
    // Provide additional output to the console
    new transports.Console({
      format: format.combine(),
    }),
  ],
});

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .commandDir(path.join(__dirname, 'commands'), {
    // eslint should ignore path and name ...
    // might use these later in logging.
    // eslint-disable-next-line
    visit: (cmd, path, name) => {
      return visit(cmd);
    },
  })
  .help('h')
  .alias('h', 'help')
  .wrap(yargs.terminalWidth())
  .epilog('copyright Microsoft, 2019').argv;

// visitor function to partially apply
// the logger to each of the registered commands
// eslint-disable-next-line
function visit(cmd: any) {
  const partialfunc = cmd.handler;
  // wrap and inject logger
  // ignore this any so we can do the partial
  // function application of the logger to the
  // command
  // eslint-disable-next-line
  cmd.handler = (argv: any) => {
    partialfunc(argv, LOGGER, APP_NAME);
  };
  return cmd;
}
