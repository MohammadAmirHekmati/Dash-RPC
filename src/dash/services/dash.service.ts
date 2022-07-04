import { Injectable, Query } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/services/callrpc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DashWalletEntity } from '../entities/dash-wallet.entity';
import { Repository } from 'typeorm';
import { DashPendingTransactionEntity } from '../entities/dash-pending-transaction.entity';
import { DashReceiveTransactionEntity } from '../entities/dash-receive-transaction.entity';
import { DashSendTransactionEntity } from '../entities/dash-send-transaction.entity';
import { CheckTransactionResponse } from '../interfaces/check-transaction.response';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { RpcResponse } from 'jsonrpc-ts';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DashService {
  constructor(private callRpcService:CallrpcService,
              @InjectRepository(DashWalletEntity) private dashWalletRepo:Repository<DashWalletEntity>,
              @InjectRepository(DashPendingTransactionEntity) private dashPendingTransactionRepo:Repository<DashPendingTransactionEntity>,
              @InjectRepository(DashReceiveTransactionEntity) private dashReceiveTransactionRepo:Repository<DashReceiveTransactionEntity>,
              @InjectRepository(DashSendTransactionEntity) private dashSendTransactionRepo:Repository<DashSendTransactionEntity>)
  {}

  async getTransactionNotify(transaction:any):Promise<any>
  {
    const checkTransaction:CheckTransactionResponse=await this.checkTransaction(transaction)
    if (checkTransaction.confirmations<1)
    {
      const transactionDetail=checkTransaction.details[0]
      if (transactionDetail.category=="receive")
      {
        const findPendingTransaction=await this.dashPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const dashPendingTransactionEntity=new DashPendingTransactionEntity()
          dashPendingTransactionEntity.account=transactionDetail.account
          dashPendingTransactionEntity.address=transactionDetail.address
          dashPendingTransactionEntity.amount=transactionDetail.amount
          dashPendingTransactionEntity.category=transactionDetail.category
          dashPendingTransactionEntity.confirmations=checkTransaction.confirmations
          dashPendingTransactionEntity.label=transactionDetail.label
          dashPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          dashPendingTransactionEntity.time=checkTransaction.time
          dashPendingTransactionEntity.txid=checkTransaction.txid
          const saved=await this.dashPendingTransactionRepo.save(dashPendingTransactionEntity)
          console.log(`We gonna receive some Litecoin  txId: ${checkTransaction.txid}`);
        }
      }
      if (transactionDetail.category=="send")
      {
        const findPendingTransaction=await this.dashPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const dashPendingTransactionEntity=new DashPendingTransactionEntity()
          dashPendingTransactionEntity.account=transactionDetail.account
          dashPendingTransactionEntity.address=transactionDetail.address
          dashPendingTransactionEntity.amount=transactionDetail.amount
          dashPendingTransactionEntity.category=transactionDetail.category
          dashPendingTransactionEntity.confirmations=checkTransaction.confirmations
          dashPendingTransactionEntity.label=transactionDetail.label
          dashPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          dashPendingTransactionEntity.time=checkTransaction.time
          dashPendingTransactionEntity.txid=checkTransaction.txid
          dashPendingTransactionEntity.fee=transactionDetail.fee
          const savedPendingTransaction=await this.dashPendingTransactionRepo.save(dashPendingTransactionEntity)
          console.log(`We lose some Lite...!  txId: ${checkTransaction.txid}`);
        }
      }
    }
  }

  async checkTransaction(txId:string):Promise<any>
  {
    const method="gettransaction"
    const params=[`${txId}`]
    const sendChechTransactionRequest=await this.callRpcService.dashCallRpc(method,params)
    return sendChechTransactionRequest.result
  }

  async unlockWallet(master_pass:string):Promise<any>
  {
    const method="walletpassphrase"
    const params=[`${master_pass}`,60]
    const sendUnlockRequest=await this.callRpcService.dashCallRpc(method,params)
  }

  async sendTransaction(sendTransactionDto:SendTransactionDto):Promise<RpcResponse<any>>
  {
    const {amount,commentFrom,commentTo,subtractFee,targetWallet}=sendTransactionDto
    const method="sendtoaddress"
    const params=[`${targetWallet}`,amount, `${commentFrom}`,`${commentTo}`,subtractFee]
    const sendTransactionRequest=await this.callRpcService.dashCallRpc(method,params)
    return sendTransactionRequest.result
  }

  async getCoreWalletBalance():Promise<any>
  {
    const method="getbalance"
    const params=[]
    const sendRpcRequest=await this.callRpcService.dashCallRpc(method,params)
    return sendRpcRequest.result
  }

  async generateNewAddress():Promise<any>
  {
    const method="getnewaddress"
    const params=[]
    const sendGenerateRequest=await this.callRpcService.dashCallRpc(method,params)

    const liteWalletEntity=new DashWalletEntity()
    liteWalletEntity.address=sendGenerateRequest.result
    const savedWalletAddress=await this.dashWalletRepo.save(liteWalletEntity)

    return sendGenerateRequest.result
  }

  async dumpPrivateKey(address:string):Promise<any>
  {
    const method="dumpprivkey"
    const params=[`${address}`]
    const walletPass=await this.callRpcService.walletOptions()
    const unlockWallet=await this.unlockWallet(walletPass.wallet_pass)
    const sendDumpRequest=await this.callRpcService.dashCallRpc(method,params)
    if (sendDumpRequest.error)
      return sendDumpRequest.error

    return sendDumpRequest.result
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async transferBalanceToMaster()
  {
    const walletOptions=await this.callRpcService.walletOptions()
    const setBalanceForTransfer=2
    const getCoreWalletBalance=await this.getCoreWalletBalance()
    if (getCoreWalletBalance<=setBalanceForTransfer)
      console.log(`Balance is not enough fo transfer to Master`);

    if (getCoreWalletBalance>setBalanceForTransfer)
    {
      const sendTransactionDto:SendTransactionDto=
        {
          targetWallet:walletOptions.target_wallet,
          subtractFee:true,
          commentTo:"",
          commentFrom:"",
          amount:getCoreWalletBalance
        }

      const sendTransactionToMasterWallet=await this.sendTransaction(sendTransactionDto)
      if (sendTransactionToMasterWallet.error)
        console.log(`Transfer to Master failed`);

      console.log(sendTransactionToMasterWallet.result);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingTransactions()
  {
    const findPendingTransactions=await this.dashPendingTransactionRepo.find()
    for (let pendingTransactions of findPendingTransactions) {
      const checkTransaction:CheckTransactionResponse=await this.checkTransaction(pendingTransactions.txid)

      if (checkTransaction.confirmations>0)
      {
        const transactionDetail=checkTransaction.details[0]
        if (transactionDetail.category=="receive")
        {
          const findReceivedTransaction=await this.dashReceiveTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findReceivedTransaction)
          {
            findReceivedTransaction.confirmations=checkTransaction.confirmations
            const savedReceivedTransaction=await this.dashReceiveTransactionRepo.save(findReceivedTransaction)
            console.log(`this Receive transaction confirmation goes up txId: ${checkTransaction.txid}`);
          }
          if (!findReceivedTransaction)
          {
            const dashReceiveTransactionEntity=new DashReceiveTransactionEntity()
            dashReceiveTransactionEntity.account=transactionDetail.account
            dashReceiveTransactionEntity.address=transactionDetail.address
            dashReceiveTransactionEntity.amount=transactionDetail.amount
            dashReceiveTransactionEntity.confirmations=checkTransaction.confirmations
            dashReceiveTransactionEntity.label=transactionDetail.label
            dashReceiveTransactionEntity.receiveTime=checkTransaction.timereceived
            dashReceiveTransactionEntity.time=checkTransaction.time
            dashReceiveTransactionEntity.txid=checkTransaction.txid
            const saveReceivedTransaction=await this.dashReceiveTransactionRepo.save(dashReceiveTransactionEntity)
            console.log(`This Transaction Received...!  txId: ${checkTransaction.txid}`);
          }
        }

        if (transactionDetail.category=="send")
        {
          const findSendTransaction=await this.dashSendTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findSendTransaction)
          {
            findSendTransaction.confirmations=checkTransaction.confirmations
            const savedSendTransaction=await this.dashSendTransactionRepo.save(findSendTransaction)
            console.log(`this send Transaction confirmation goes up  txId: ${checkTransaction.txid}`);
          }
          if (!findSendTransaction)
          {
            const dashSendTransactionEntity=new DashSendTransactionEntity()
            dashSendTransactionEntity.address=transactionDetail.address
            dashSendTransactionEntity.amount=transactionDetail.amount
            dashSendTransactionEntity.category=transactionDetail.category
            dashSendTransactionEntity.confirmations=checkTransaction.confirmations
            dashSendTransactionEntity.fee=transactionDetail.fee
            dashSendTransactionEntity.label=transactionDetail.label
            dashSendTransactionEntity.receiveTime=checkTransaction.timereceived
            dashSendTransactionEntity.time=checkTransaction.time
            dashSendTransactionEntity.txid=checkTransaction.txid
            const saveSendTransaction=await this.dashSendTransactionRepo.save(dashSendTransactionEntity)
            console.log(`We lose some doge...!  txId: ${checkTransaction.txid}`);
          }
        }
      }
    }

  }
}