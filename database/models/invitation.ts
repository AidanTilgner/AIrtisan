import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { Organization } from "./organization";
import { Admin } from "./admin";

@Entity()
export class OrganizationInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Organization, { eager: true })
  organization!: Organization;

  @ManyToOne(() => Admin, { eager: true })
  admin!: Admin;

  @Column("text")
  token!: string;

  @Column("boolean", {
    default: false,
  })
  accepted!: boolean;

  @Column("boolean", {
    default: false,
  })
  completed!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
