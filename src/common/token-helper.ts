import * as jwt from 'jsonwebtoken';

import { Logger } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TokenStctureDto } from 'src/websocket/dtos/token-structure.dto';

const logger = new Logger('getSubFromToken');

export default function getSubFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      logger.error(`Invalid JWT structure for token: [REDACTED]`);
      return null;
    }

    const dtoInstance = plainToInstance(TokenStctureDto, decoded);
    const errors = validateSync(dtoInstance);

    if (errors.length > 0) {
      logger.error(`Invalid token structure: ${JSON.stringify(errors)}`);
      return null;
    }

    return dtoInstance.sub;
  } catch (e) {
    logger.error('Failed to decode JWT', e instanceof Error ? e.stack : e);
    return null;
  }
}
