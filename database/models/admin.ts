import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from "typeorm";

import { comparePassword as compPass } from "../../utils/crypto";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  username!: string;

  @Column("text")
  password!: string;

  @Column("text")
  role: "admin" | "superadmin" = "admin";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  async comparePassword(password: string) {
    return compPass(password, this.password);
  }
}
