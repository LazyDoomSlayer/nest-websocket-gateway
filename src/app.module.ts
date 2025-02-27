import { Module } from '@nestjs/common';
import { WebsocketModule } from './websocket/websocket.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [WebsocketModule],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
