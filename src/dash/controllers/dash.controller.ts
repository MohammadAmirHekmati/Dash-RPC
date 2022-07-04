import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DashService } from '../services/dash.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';

@Controller("dash")
export class DashController {
  constructor(private dashService:DashService) {
  }

  @Get("transaction/notify")
  async getTransactionNotify(@Query("transaction") transaction:any):Promise<any>
  {
    return await this.dashService.getTransactionNotify(transaction)
  }

  @Get("core/balance")
  async getCoreWalletBalance():Promise<any>
  {
    return await this.dashService.getCoreWalletBalance()
  }

  @Post("send/transaction")
  async sendTransaction(@Body() sendTransactionDto:SendTransactionDto):Promise<any>
  {
    return await this.dashService.sendTransaction(sendTransactionDto)
  }

  @Get("check/transaction/:txId")
  async checkTransaction(@Param("txId") txId:string):Promise<any>
  {
    return await this.dashService.checkTransaction(txId)
  }

  @Get("generate/new/address")
  async generateNewAddress():Promise<any>
  {
    return await this.dashService.generateNewAddress()
  }

  @Get("dump/private/key/:address")
  async dumpPrivateKey(@Param("address") address:string):Promise<any>
  {
    return await this.dashService.dumpPrivateKey(address)
  }
}