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
import { dataSource } from "..";

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

  @Column("text", {
    nullable: true,
  })
  profile_picture_path!: string;

  @OneToMany(() => Organization, (organization) => organization.owner)
  owned_organizations!: Organization[];

  @ManyToMany(() => Organization, (organization) => organization.admins)
  organizations!: Organization[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  async comparePassword(password: string) {
    // we have to select the password manually because it is hidden by default
    const selectedPassword = await dataSource.manager.findOne(Admin, {
      select: ["password"],
      where: { id: this.id },
    });
    if (!selectedPassword) return false;
    return compPass(password, selectedPassword.password);
  }
}
