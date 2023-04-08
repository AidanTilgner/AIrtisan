import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Conversation } from "./conversation";

export type ChatRole = "user" | "assistant";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  session_id!: string;

  @Column()
  message!: string;

  @Column()
  intent!: string;

  @Column({
    nullable: true,
  })
  confidence!: number;

  @Column()
  role!: ChatRole;

  @Column({ type: "boolean" })
  enhanced = false;

  @Column({ type: "boolean" })
  needs_review = false;

  @Column({
    nullable: true,
  })
  review_text!: string;

  @Column({
    nullable: true,
  })
  reviewer: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.chats)
  conversation!: Conversation;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
