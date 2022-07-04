import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionDto {
  @ApiProperty()
  targetWallet:string

  @ApiProperty()
  amount:number

  @ApiProperty()
  commentFrom:string

  @ApiProperty()
  commentTo:string

  @ApiProperty()
  subtractFee:boolean
}