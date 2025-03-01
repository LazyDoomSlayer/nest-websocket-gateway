import { IsUUID, IsString } from 'class-validator';

export class DeleteSessionDto {
  @IsUUID()
  user_id: string;

  @IsString()
  connection_id: string;
}
