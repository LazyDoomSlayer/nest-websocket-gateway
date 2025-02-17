import { EWebsocketClient } from './websocket-client.enum';

export interface WebSocketClientData {
  sub: string;
  client: EWebsocketClient;
}
