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

  @Column("int")
  order!: number;

  @Column("text")
  session_id!: string;

  @Column("text")
  message!: string;

  @Column("text")
  intent!: string;

  @Column("int", {
    nullable: true,
  })
  confidence!: number;

  @Column("text")
  role!: ChatRole;

  @Column({ type: "boolean" })
  enhanced = false;

  @Column({ type: "boolean" })
  needs_review = false;

  @Column("text", {
    nullable: true,
  })
  review_text!: string;

  @Column("text", {
    nullable: true,
  })
  reviewer!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.chats)
  conversation!: Conversation;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
