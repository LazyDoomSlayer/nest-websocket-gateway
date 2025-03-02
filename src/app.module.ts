import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionsModule } from './sessions/sessions.module';
import { WebsocketModule } from './websocket/websocket.module';

import { Session } from './sessions/sessions.entity';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nest-websocket-gateway-db',
      entities: [Session],
      // Migrations
      autoLoadEntities: false,
      synchronize: true,
    }),
    WebsocketModule,
    SessionsModule,
    AuthModule,
    RoomsModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
