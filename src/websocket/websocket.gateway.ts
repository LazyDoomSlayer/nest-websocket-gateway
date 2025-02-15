import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
@WebSocketGateway({
  // cors: {
  //   origin: '*',
  //   //   [
  //   //   'https://nfc-handler.lazydoomslayer.dev',
  //   //   'https://nfc-reader.lazydoomslayer.dev',
  //   // ],
  //   methods: ['GET', 'POST'],
  //   credentials: true,
  // },
  transports: ['websocket'],
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(_server: Server) {
    this.logger.log('WebSocket server initialized with WSS');
  }

  handleConnection(client: Socket) {
    console.log(client);
    // try {
    //   const token = client.handshake.auth?.token;
    //   const device = client.handshake.auth?.device;
    //   this.logger.debug(
    //     `Incoming connection. Token: ${token}, Device: ${device}`,
    //   );
    //
    //   if (!token) {
    //     throw new UnauthorizedException('No token provided');
    //   }
    //
    //   const decodedToken: any = jwt.decode(token);
    //   this.logger.debug(`Decoded token: ${JSON.stringify(decodedToken)}`);
    //   if (!decodedToken || !decodedToken.sub) {
    //     throw new UnauthorizedException('Invalid token format');
    //   }
    //
    //   const userId = decodedToken.sub;
    //   const socketId = client.id;
    //   this.logger.log(`✅ Client connected: ${userId} (Socket: ${socketId})`);
    //
    //   client.data.userId = userId;
    //   client.join(userId);
    //
    //   if (device) {
    //     client.data.device = device;
    //     client.join(device);
    //   }
    //
    //   const joinedRooms = Array.from(client.rooms).join(', ');
    //   this.logger.debug(`Client ${socketId} rooms: ${joinedRooms}`);
    // } catch (error: any) {
    //   this.logger.warn(`❌ Connection denied: ${error.message}`);
    //   client.disconnect();
    // }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('private-message')
  handlePrivateMessage(
    @MessageBody() data: { recipientId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    if (!senderId || !data.recipientId) {
      this.logger.warn(
        `Missing sender or recipient info. Sender: ${senderId}, Recipient: ${data.recipientId}`,
      );
      return;
    }

    this.logger.log(
      `📩 Private message from ${senderId} to ${data.recipientId}: ${data.message}`,
    );

    const rooms = this.server.sockets.adapter.rooms;
    if (rooms.has(data.recipientId)) {
      const socketsInRoom = Array.from(rooms.get(data.recipientId) || []);
      this.logger.debug(
        `Room "${data.recipientId}" exists. Connected sockets: ${socketsInRoom.join(', ')}`,
      );
    } else {
      this.logger.warn(
        `Room "${data.recipientId}" does not exist! Message may not be delivered.`,
      );
    }

    this.server.to(data.recipientId).emit('private-message', {
      sender: senderId,
      message: data.message,
    });
    this.logger.debug(`Emitted message to room: ${data.recipientId}`);
  }
}
