import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashWalletEntity } from './entities/dash-wallet.entity';
import { DashSendTransactionEntity } from './entities/dash-send-transaction.entity';
import { DashReceiveTransactionEntity } from './entities/dash-receive-transaction.entity';
import { DashPendingTransactionEntity } from './entities/dash-pending-transaction.entity';
import { DashController } from './controllers/dash.controller';
import { DashService } from './services/dash.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CallrpcService } from '../callrpc/services/callrpc.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([DashWalletEntity,DashSendTransactionEntity,DashReceiveTransactionEntity,DashPendingTransactionEntity]),
    ScheduleModule.forRoot()
  ],
  controllers:[DashController],
  providers:[DashService,CallrpcService]
})
export class DashModule {}
