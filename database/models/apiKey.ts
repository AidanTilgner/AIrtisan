import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { comparePassword } from "../../utils/crypto";
import { Bot } from "./bot";

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  key!: string;

  @Column("text")
  for!: string;

  @ManyToOne(() => Bot, (bot) => bot.apiKeys, { eager: true })
  bot!: Bot;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  public compareKey(key: string) {
    return comparePassword(key, this.key);
  }
}
