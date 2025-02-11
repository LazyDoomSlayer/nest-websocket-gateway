import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { IoAdapter } from '@nestjs/platform-socket.io';
import { readFileSync } from 'fs';
import * as https from 'https';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('ssl/key.pem'),
    cert: readFileSync('ssl/cert.pem'),
  };

  const server = https.createServer(httpsOptions);

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.0.164:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  });
  await app.listen(3000, '192.168.0.164');
  console.log('Secure WebSocket server running on wss://localhost:3000');
}
bootstrap();
