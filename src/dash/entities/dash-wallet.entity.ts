import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:"crypto_dash_wallet"})
export class DashWalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  address:string

  @CreateDateColumn({type:"timestamp with time zone"})
  createAt:Date
}