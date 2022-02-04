import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongGateway } from './pong.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PongGateway],
})
export class AppModule {}
