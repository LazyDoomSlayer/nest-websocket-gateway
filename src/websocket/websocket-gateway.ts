import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Injectable, Logger } from '@nestjs/common';

import { NfcScanDTO } from './dtos/nfc-scan.dto';
import { NfcResponseDTO } from './dtos/nfc-response.dto';

import { WebsocketAuthService } from './services/websocket-auth.service';
import { WebsocketValidationService } from './services/websocket-validation.service';

import { WebSocketClientData } from './dtos/websocket-client.interface';
import { EWebsocketClient } from './dtos/websocket-client.enum';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
})
export class WebsocketGateway {
  constructor(
    private readonly websocketAuthService: WebsocketAuthService,
    private readonly websocketValidationService: WebsocketValidationService,
  ) {}
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
    const dtoInstance = await this.websocketValidationService.validatePayload(
      NfcScanDTO,
      payload,
    );
    if (!dtoInstance) {
      socketClient.emit('error', { message: 'Invalid payload' });
      return;
    }

    const clientData = socketClient.data as WebSocketClientData;

    if (clientData.client === EWebsocketClient.READER) {
      socketClient.to(EWebsocketClient.HANDLER).emit('nfc-scan', {
        from: clientData.sub,
        ...dtoInstance,
      });
    } else {
      socketClient.emit('error', {
        message: 'Only READER clients can send NFC scan data',
      });
    }
  }

  @SubscribeMessage('nfc-response')
  async handleNfcResponse(
    @MessageBody() payload: any,
    @ConnectedSocket() socketClient: Socket,
  ) {
    const dtoInstance = await this.websocketValidationService.validatePayload(
      NfcResponseDTO,
      payload,
    );
    if (!dtoInstance) {
      socketClient.emit('error', { message: 'Invalid payload' });
      return;
    }

    const clientData = socketClient.data as WebSocketClientData;

    if (clientData.client === EWebsocketClient.HANDLER) {
      socketClient.to(EWebsocketClient.READER).emit('nfc-response', {
        from: clientData.sub,
        ...dtoInstance,
      });
    } else {
      socketClient.emit('error', {
        message: 'Only HANDLER clients can send NFC response data',
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
