import { Injectable } from '@nestjs/common';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

import { AuthUserDto } from 'src/websocket/dtos/auth-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'a-string-secret-at-least-256-bits-long',
      issuer: 'aws',
    });
  }

  async validate(payload: AuthUserDto): Promise<AuthUserDto> {
    return payload;
  }
}
