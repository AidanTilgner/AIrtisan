import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { OwnerTypes } from "../../types/lib";

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column("text", {
    unique: true,
  })
  slug!: string;

  @Column("text")
  context_file!: string;

  @Column("text")
  corpus_file!: string;

  @Column("text")
  model_file!: string;

  @Column("int")
  owner_id!: number;

  @Column("text")
  owner_type!: OwnerTypes;

  @Column("text", {
    default: "private",
  })
  visibility!: "private" | "public" | "unlisted";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
