import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Chat } from "./chat";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  session_id!: string;

  @OneToMany(() => Chat, (chat) => chat.conversation)
  chats!: Chat[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
