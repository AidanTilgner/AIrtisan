import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Chat } from "./chat";

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

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
