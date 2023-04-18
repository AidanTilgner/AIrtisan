import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Chat } from "./chat";
import { Bot } from "./bot";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text", {
    nullable: true,
  })
  generated_name!: string;

  @Column("text")
  session_id!: string;

  @Column("boolean", {
    nullable: true,
  })
  training_copy!: boolean;

  @OneToMany(() => Chat, (chat) => chat.conversation, { eager: true })
  chats!: Chat[];

  @ManyToOne(() => Bot, (bot) => bot.conversations)
  bot!: Bot;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
