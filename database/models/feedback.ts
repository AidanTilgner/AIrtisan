import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Admin } from "./admin";

export type FeedbackType = "feedback" | "bug" | "feature";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  feedback!: string;

  @Column("text")
  type!: FeedbackType;

  @ManyToOne(() => Admin, (admin) => admin.feedbacks, { eager: true })
  admin!: Admin;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
