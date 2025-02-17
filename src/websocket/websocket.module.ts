import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket-gateway';
import { WebsocketValidationService } from './services/websocket-validation.service';
import { WebsocketAuthService } from './services/websocket-auth.service';

@Module({
  providers: [
    WebsocketGateway,
    WebsocketAuthService,
    WebsocketValidationService,
  ],
  exports: [WebsocketValidationService, WebsocketAuthService],
})
export class WebsocketModule {}
