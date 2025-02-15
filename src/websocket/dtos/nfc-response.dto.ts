import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ENFCScanStatus } from '../websocket-client.enum';

export class NfcResponseDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  message: string;

  @IsEnum(ENFCScanStatus)
  status: string;
}
