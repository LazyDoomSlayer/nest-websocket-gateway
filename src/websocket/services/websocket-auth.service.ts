import { Socket } from 'socket.io';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { WebSocketClientData } from '../dtos/websocket-client.interface';

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WebsocketAuthObjectDto } from 'src/auth/dtos/old-auth.dto';

@Injectable()
export class WebsocketAuthService {
  private readonly logger = new Logger(WebsocketAuthService.name);

  async validateClient(
    socketClient: Socket,
  ): Promise<WebSocketClientData | null> {
    try {
      // TODO: do we need this ?
      this.logger.debug(`Starting validation for client ${socketClient.id}`);
      const websocketAuthObject = socketClient.handshake.auth;

      const dtoInstance = plainToInstance(
        WebsocketAuthObjectDto,
        websocketAuthObject,
      );
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        this.logger.error(
          `Validation failed for client ${socketClient.id}: ${JSON.stringify(errors)}`,
        );
        socketClient.disconnect();
        return null;
      }

      const { token, client } = dtoInstance;
      if (!token) {
        this.logger.error(
          `Authentication error for client ${socketClient.id}: No token provided`,
        );
        throw new UnauthorizedException('No token provided');
      }

      // TODO: remove not needed after adding guards
      const dummyYes = true;
      const sub = 'Some';
      if (dummyYes) {
        this.logger.error(
          `Authentication error for client ${socketClient.id}: Token not valid`,
        );
        throw new UnauthorizedException('Token not valid');
      }

      this.logger.log(
        `Client ${socketClient.id} authenticated successfully with sub ${sub} and client type ${client}`,
      );
      return { sub, client };
    } catch (_error) {
      this.logger.error(`Authentication failed for client ${socketClient.id}`);
      socketClient.disconnect();
      return null;
    }
  }
}
