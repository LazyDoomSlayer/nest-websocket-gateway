import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { EWebsocketSessionClient } from './session.enum';

export class CreateSessionDto {
  @IsUUID()
  user_id: string;

  @IsString()
  connection_id: string;

  @IsString()
  @IsOptional()
  device?: string;

  @IsEnum(EWebsocketSessionClient)
  app_type: EWebsocketSessionClient;
}
