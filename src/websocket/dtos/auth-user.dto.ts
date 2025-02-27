import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthUserDto {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  admin: boolean;

  @IsNumber()
  iat: number;
}
