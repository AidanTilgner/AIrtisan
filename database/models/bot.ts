import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Conversation } from "./conversation";
import { OwnerTypes } from "../../types/lib";
import { ApiKey } from "./apiKey";

@Entity()
export class Bot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column("text")
  bot_language!: string;

  @Column("text")
  context_file!: string;

  @Column("text")
  corpus_file!: string;

  @Column("text")
  model_file!: string;

  @Column("text")
  bot_version!: string;

  @Column("text")
  enhancement_model!: string;

  @Column("int")
  owner_id!: number;

  @Column("text")
  owner_type!: OwnerTypes;

  @Column("text", {
    default: "private",
  })
  visibility!: "private" | "public" | "unlisted";

  @Column("boolean", {
    default: false,
  })
  is_running!: boolean;

  @OneToMany(() => Conversation, (conversation) => conversation.bot)
  conversations!: Conversation[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.bot)
  apiKeys!: ApiKey[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
