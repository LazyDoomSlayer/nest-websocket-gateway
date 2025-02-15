import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WebsocketAuthObjectDto } from './dtos/websocket-auth.dto';
import { validate } from 'class-validator';
import getSubFromToken from 'src/common/token-helper';
import { NfcScanDTO } from './dtos/nfc-scan.dto';
import { EWebsocketClient } from './websocket-client.enum';
import { WebSocketClientData } from './websocket-client.interface';
import { NfcResponseDTO } from './dtos/nfc-response.dto';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
})
export class WebsocketGateway {
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('WebSocket server initialized with WSS');
  }

  async handleConnection(socketClient: Socket): Promise<void> {
    try {
      const websocketAuthObject = socketClient.handshake.auth;

      const dtoInstance = plainToInstance(
        WebsocketAuthObjectDto,
        websocketAuthObject,
      );
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        console.error('Validation failed:', errors);
        socketClient.disconnect();
        return;
      }

      const { token, client } = dtoInstance;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const sub = getSubFromToken(token);
      if (!sub) {
        throw new UnauthorizedException('Token not valid');
      }

      socketClient.data = {
        sub,
        client,
      };

      await socketClient.join(sub);

      if (client) {
        await socketClient.join(client);
      }
    } catch (error) {
      console.error(error);
      socketClient.disconnect();
    }
  }

  @SubscribeMessage('nfc-scan')
  async handleNfcScan(
    @MessageBody() payload: any,
    @ConnectedSocket() socketClient: Socket,
  ) {
    try {
      const dtoInstance = plainToInstance(NfcScanDTO, payload);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socketClient.emit('error', { message: 'Invalid payload', errors });
        return;
      }

      const {
        deviceExtendedUniqueIdentifier,
        applicationExtendedUniqueIdentifier,
      } = dtoInstance;
      const clientData = socketClient.data as WebSocketClientData;

      if (clientData.client === EWebsocketClient.READER) {
        socketClient.to(EWebsocketClient.HANDLER).emit('nfc-scan', {
          from: clientData.sub,
          deviceExtendedUniqueIdentifier,
          applicationExtendedUniqueIdentifier,
        });
        return;
      }

      socketClient.emit('error', {
        message: 'Only READER clients can send NFC scan data',
      });
    } catch (error) {
      this.logger.error('Error processing NFC scan:', error);
      socketClient.emit('error', { message: 'Internal server error' });
    }
  }

  @SubscribeMessage('nfc-response')
  async handleNfcResponse(
    @MessageBody() payload: any,
    @ConnectedSocket() socketClient: Socket,
  ) {
    try {
      const dtoInstance = plainToInstance(NfcResponseDTO, payload);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        this.logger.error('Validation failed:', errors);
        socketClient.emit('error', { message: 'Invalid payload', errors });
        return;
      }

      const { status } = dtoInstance;

      if (!status) {
        socketClient.emit('error', { message: 'Invalid response format' });
        return;
      }

      const clientData = socketClient.data as WebSocketClientData;

      if (clientData.client === EWebsocketClient.HANDLER) {
        socketClient.to(EWebsocketClient.READER).emit('nfc-response', {
          from: clientData.sub,
          ...dtoInstance,
        });
        return;
      }

      socketClient.emit('error', {
        message: 'Only HANDLER clients can send NFC response data',
      });
    } catch (error) {
      this.logger.error('Error processing NFC response:', error);
      socketClient.emit('error', { message: 'Internal server error' });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
