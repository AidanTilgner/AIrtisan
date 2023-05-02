import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";
import { Admin } from "./admin";

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @ManyToOne(() => Admin, (admin) => admin.owned_organizations, {
    eager: true,
    nullable: false,
  })
  owner!: Admin;

  @ManyToMany(() => Admin, (admin) => admin.organizations)
  @JoinTable()
  admins!: Admin[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
