import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Organization } from "./organization";
import { comparePassword as compPass } from "../../utils/crypto";
import { AdminRoles } from "../../types/lib";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  username!: string;

  @Column("text", {
    select: false,
  })
  password!: string;

  @Column("text", {
    nullable: true,
  })
  display_name!: string;

  @Column("text", {
    nullable: true,
  })
  email!: string;

  @Column("text")
  role: AdminRoles = "admin";

  @OneToMany(() => Organization, (organization) => organization.owner)
  owned_organizations!: Organization[];

  @ManyToMany(() => Organization, (organization) => organization.admins)
  organizations!: Organization[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  async comparePassword(password: string) {
    return compPass(password, this.password);
  }
}
