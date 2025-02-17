import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class WebsocketValidationService {
  private readonly logger = new Logger(WebsocketValidationService.name);

  async validatePayload<T>(
    dtoClass: new () => T,
    payload: any,
  ): Promise<T | null> {
    const dtoInstance = plainToInstance(dtoClass, payload);
    const errors = await validate(dtoInstance as object);

    if (errors.length > 0) {
      this.logger.error('Validation failed:', errors);
      return null;
    }

    return dtoInstance;
  }
}
