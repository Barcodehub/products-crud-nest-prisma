import { Module } from '@nestjs/common';
import { WebSocketsGateway } from './websockets.gateway';

@Module({
  providers: [WebSocketsGateway],
  exports: [WebSocketsGateway],
})
export class WebSocketsModule {}
