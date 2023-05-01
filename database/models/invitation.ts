import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { Organization } from "./organization";
import { Admin } from "./admin";

@Entity()
export class OrganizationInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Organization, { eager: true })
  organization!: Organization;

  @OneToOne(() => Admin, { eager: true })
  admin!: Admin;

  @Column("text")
  token!: string;

  @Column("boolean", {
    default: false,
  })
  accepted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
