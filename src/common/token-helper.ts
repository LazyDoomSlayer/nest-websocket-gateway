import * as jwt from 'jsonwebtoken';

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TokenStctureDto } from 'src/websocket/dtos/token-structure.dto';

export default function getSubFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      console.error('Invalid JWT structure');
      return null;
    }

    const dtoInstance = plainToInstance(TokenStctureDto, decoded);
    const errors = validateSync(dtoInstance);

    if (errors.length > 0) {
      console.error('Invalid token structure:', errors);
      return null;
    }

    return dtoInstance.sub;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}
