import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Injectable, Logger } from '@nestjs/common';

import { NfcScanDTO } from './dtos/nfc-scan.dto';
import { NfcResponseDTO } from './dtos/nfc-response.dto';

import { WebSocketClientData } from './dtos/websocket-client.interface';
import { EWebsocketClient } from './dtos/websocket-client.enum';
import { SessionRepository } from 'src/sessions/session.repository';

import { JwtService } from '@nestjs/jwt';
import { RoomRepository } from 'src/rooms/room.repository';
import { WebsocketService } from './websocket.service';

@Injectable()
@WebSocketGateway({
  transports: ['websocket'],
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly roomRepository: RoomRepository,
    private readonly jwtService: JwtService,
    private readonly websocketService: WebsocketService,
  ) {}
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('WebSocket server initialized with WSS');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      const deviceId = client.id;

      const activeSessions =
        await this.sessionRepository.findActiveSessions(userId);
      if (activeSessions.length >= 2) {
        client.emit('error', 'Max connections reached');
        client.disconnect();
        return;
      }

      await this.sessionRepository.createSession(userId, deviceId);

      let room = await this.roomRepository.findRoomByUser(userId);
      if (!room) {
        room = await this.roomRepository.createRoom(userId, deviceId);
      } else if (!room.device2) {
        await this.roomRepository.addSecondDevice(room.id, deviceId);
      } else {
        client.emit('error', 'Room is full');
        client.disconnect();
        return;
      }

      client.join(room.id);
      console.log(
        `User ${userId} joined room ${room.id} with device ${deviceId}`,
      );
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const session = await this.sessionRepository.findActiveSessions(client.id);
    if (!session) return;

    await this.sessionRepository.closeSession(client.id);

    const room = await this.roomRepository.findRoomByUser(session.userId);
    if (room) {
      await this.roomRepository.removeDevice(room.id, client.id);
    }
  }

  // async handleConnection(socketClient: Socket): Promise<void> {
  //   this.logger.log(`Client connected: ${socketClient.id}`);
  //
  //   // TODO: add database to search for session by user and experations
  //   // TODO: check for session.exp to be valid
  //
  //   //   const clientData =
  //   //     await this.websocketAuthService.validateClient(socketClient);
  //   //   if (!clientData) {
  //   //     this.logger.warn(`Client validation failed: ${socketClient.id}`);
  //   //     return;
  //   //   }
  //   //
  //   //   socketClient.data = clientData;
  //   //   await socketClient.join(clientData.sub);
  //   //   this.logger.log(`Client ${socketClient.id} joined room ${clientData.sub}`);
  //   //
  //   //   if (clientData.client) {
  //   //     await socketClient.join(clientData.client);
  //   //     this.logger.log(
  //   //       `Client ${socketClient.id} joined room ${clientData.client}`,
  //   //     );
  //   //   }
  // }

  @SubscribeMessage('nfc-scan')
  async handleNfcScan(
    @MessageBody() payload: any,
    @ConnectedSocket() socketClient: Socket,
  ) {
    this.logger.debug(
      `Received NFC scan payload from ${socketClient.id}: ${JSON.stringify(payload)}`,
    );
    const dtoInstance = await this.websocketService.validatePayload(
      NfcScanDTO,
      payload,
    );

    if (!dtoInstance) {
      this.logger.warn(`Invalid NFC scan payload from ${socketClient.id}`);
      socketClient.emit('error', { message: 'Invalid payload' });
      return;
    }

    const clientData = socketClient.data as WebSocketClientData;
    try {
      if (clientData.client !== EWebsocketClient.READER) {
        this.logger.warn(
          `Unauthorized NFC scan attempt from client ${socketClient.id}`,
        );
        socketClient.emit('error', {
          message: 'Only READER clients can send NFC scan data',
        });
        return;
      }

      socketClient.to(EWebsocketClient.HANDLER).emit('nfc-scan', {
        from: clientData.sub,
        ...dtoInstance,
      });
      this.logger.log(
        `NFC scan data forwarded from ${clientData.sub} to HANDLER`,
      );
    } catch (_error) {
      this.logger.error(`Error handling NFC scan from ${clientData.sub}`);
    }
  }

  @SubscribeMessage('nfc-response')
  async handleNfcResponse(
    @MessageBody() payload: any,
    @ConnectedSocket() socketClient: Socket,
  ) {
    this.logger.debug(
      `Received NFC response payload from ${socketClient.id}: ${JSON.stringify(payload)}`,
    );
    const dtoInstance = await this.websocketService.validatePayload(
      NfcResponseDTO,
      payload,
    );

    if (!dtoInstance) {
      this.logger.warn(`Invalid NFC response payload from ${socketClient.id}`);
      socketClient.emit('error', { message: 'Invalid payload' });
      return;
    }

    const clientData = socketClient.data as WebSocketClientData;
    try {
      if (clientData.client !== EWebsocketClient.HANDLER) {
        this.logger.warn(
          `Unauthorized NFC response attempt from client ${socketClient.id}`,
        );
        socketClient.emit('error', {
          message: 'Only HANDLER clients can send NFC response data',
        });
        return;
      }

      socketClient.to(EWebsocketClient.READER).emit('nfc-response', {
        from: clientData.sub,
        ...dtoInstance,
      });
      this.logger.log(
        `NFC response data forwarded from ${clientData.sub} to READER`,
      );
    } catch (_error) {
      this.logger.error(`Error handling NFC response from ${clientData.sub}`);
    }
  }
}
