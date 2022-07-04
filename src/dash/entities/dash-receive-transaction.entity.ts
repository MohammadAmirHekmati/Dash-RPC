import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:"crypto_dash_transaction_receive"})
export class DashReceiveTransactionEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  txid:string

  @Column({nullable:true})
  confirmations:number

  @Column()
  time:number

  @Column()
  receiveTime:number

  @Column()
  address:string

  @Column({type:"float",nullable:true})
  amount:number

  @Column({nullable:true})
  label:string


  @Column()
  account:string
}