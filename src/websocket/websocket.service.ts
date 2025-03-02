import { Injectable, Logger } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);

  async validatePayload<T>(
    dtoClass: new () => T,
    payload: any,
  ): Promise<T | null> {
    this.logger.debug(
      `Validating payload for DTO ${dtoClass.name}. Payload: ${JSON.stringify(payload)}`,
    );

    const dtoInstance = plainToInstance(dtoClass, payload);
    const errors = await validate(dtoInstance as object);

    if (errors.length > 0) {
      this.logger.error(
        `Validation failed for DTO ${dtoClass.name}. Errors: ${JSON.stringify(errors)}`,
      );
      return null;
    }

    this.logger.debug(`Payload validation successful for DTO ${dtoClass.name}`);
    return dtoInstance;
  }
}
