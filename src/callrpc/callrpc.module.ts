import { Module } from '@nestjs/common';
import { CallrpcService } from './services/callrpc.service';


@Module({
  providers: [CallrpcService]
})
export class CallrpcModule {}
