import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Conversation } from "./conversation";
import { Organization } from "./organization";

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

  @OneToMany(() => Conversation, (conversation) => conversation.bot)
  conversations!: Conversation[];

  @ManyToOne(() => Organization, (organization) => organization.bots)
  organization!: Organization;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
