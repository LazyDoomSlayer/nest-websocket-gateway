import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WebSocketClientData } from '../dtos/websocket-client.interface';
import { plainToInstance } from 'class-transformer';
import { WebsocketAuthObjectDto } from '../dtos/websocket-auth.dto';
import { validate } from 'class-validator';
import getSubFromToken from 'src/common/token-helper';

@Injectable()
export class WebsocketAuthService {
  private readonly logger = new Logger(WebsocketAuthService.name);

  async validateClient(
    socketClient: Socket,
  ): Promise<WebSocketClientData | null> {
    try {
      const websocketAuthObject = socketClient.handshake.auth;

      const dtoInstance = plainToInstance(
        WebsocketAuthObjectDto,
        websocketAuthObject,
      );
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socketClient.disconnect();
        return null;
      }

      const { token, client } = dtoInstance;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const sub = getSubFromToken(token);
      if (!sub) {
        throw new UnauthorizedException('Token not valid');
      }

      return { sub, client };
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      socketClient.disconnect();
      return null;
    }
  }
}
