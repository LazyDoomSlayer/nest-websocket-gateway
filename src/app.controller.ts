import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { AuthUserDto } from './auth/dtos/auth-user.dto';

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
