import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:"crypto_dash_transaction_pending"})
export class DashPendingTransactionEntity {
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
  category:string

  @Column()
  address:string

  @Column({type:"float",nullable:true})
  amount:number

  @Column({nullable:true})
  label:string

  @Column({type:"float",nullable:true})
  fee:number

  @Column({nullable:true})
  commentFrom:string

  @Column({nullable:true})
  commentTo:string

  @Column()
  account:string
}