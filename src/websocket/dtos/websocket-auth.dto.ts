import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { EWebsocketClient } from '../websocket-client.enum.ts dtos/websocket-client.enum';

export class WebsocketAuthObjectDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(EWebsocketClient)
  client: string;
}
