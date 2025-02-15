import { IsNotEmpty, IsString } from 'class-validator';

export class TokenStctureDto {
  @IsString()
  @IsNotEmpty()
  sub: string;
}
