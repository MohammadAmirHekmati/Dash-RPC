import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CallrpcModule } from './callrpc/callrpc.module';
import { DashModule } from './dash/dash.module';

@Module({
  imports: [DatabaseModule, CallrpcModule, DashModule]
})
export class AppModule {}
