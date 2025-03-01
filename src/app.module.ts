import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from './strategies/jwt.strategy';

import { SessionsModule } from './sessions/sessions.module';
import { WebsocketModule } from './websocket/websocket.module';

import { Session } from './sessions/sessions.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nest-websocket-gateway-tb',
      entities: [Session],
      // Migrations
      autoLoadEntities: false,
      synchronize: true,
    }),
    WebsocketModule,
    SessionsModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
