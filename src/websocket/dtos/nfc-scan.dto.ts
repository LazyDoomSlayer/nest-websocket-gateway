import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class NfcScanDTO {
  @IsString()
  @IsNotEmpty()
  deviceExtendedUniqueIdentifier: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  applicationExtendedUniqueIdentifier: string;
}
