import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';

import { AuthUserDto } from './websocket/dtos/auth-user.dto';

@Controller()
export class AppController {
  @Get('connect-ws')
  @UseGuards(JwtAuthGuard)
  handler(@Req() request: Request, @Res() response: Response) {
    const host = request.headers.host;

    // TODO: Let say that we also created session for user in database
    const sessionId = 'random-session-id';
    const user = <AuthUserDto>request.user;

    response.send({
      clientId: user.sub,
      sessionId,
      url: `wss://${host}/connect?sid=${sessionId}`,
    });
  }
}
