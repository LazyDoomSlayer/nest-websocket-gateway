import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NfcScanDTO } from './dtos/nfc-scan.dto';
import { NfcResponseDTO } from './dtos/nfc-response.dto';
import { WebsocketAuthService } from './services/websocket-auth.service';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
})
export class WebsocketGateway {
  constructor(private readonly websocketAuthService: WebsocketAuthService) {}
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('WebSocket server initialized with WSS');
  }

  async handleConnection(socketClient: Socket): Promise<void> {
    const clientData =
      await this.websocketAuthService.validateClient(socketClient);
    if (!clientData) return;

    socketClient.data = clientData;
    await socketClient.join(clientData.sub);

    if (clientData.client) {
      await socketClient.join(clientData.client);
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
