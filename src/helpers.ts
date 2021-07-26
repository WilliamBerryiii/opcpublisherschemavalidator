import fs from 'fs';
import winston from 'winston';

export function WriteContentToFile(
  outputFileName: string,
  content: string,
  logger: winston.Logger
): void {
  try {
    fs.writeFileSync(outputFileName, content, {flag: 'w+', encoding: 'utf8'});
  } catch (err) {
    logger.error(
      `Failed writing schema file (${outputFileName}) with error ${
        (err as Error).message
      }`
    );
  }
}
