import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { comparePassword } from "../../utils/crypto";

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  key!: string;

  @Column("text")
  for!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  public compareKey(key: string) {
    return comparePassword(key, this.key);
  }
}
