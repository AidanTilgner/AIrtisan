import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Admin } from "./admin";
import { Bot } from "./bot";

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @ManyToMany(() => Admin, (admin) => admin.organizations)
  @JoinTable()
  admins!: Admin[];

  @OneToMany(() => Bot, (bot) => bot.organization)
  bots!: Bot[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
