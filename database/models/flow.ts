// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
//   ManyToOne,
// } from "typeorm";
// import { Bot } from "./bot";

// @Entity()
// export class IntentNode {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column("text")
//   name!: string;

//   @ManyToOne(() => Bot, (bot) => bot.intent_flow)
//   bot!: Bot;

//   @OneToMany(() => IntentEdge, (intentEdge) => intentEdge.from)
//   edges!: IntentEdge[];

//   @CreateDateColumn()
//   created_at!: Date;

//   @UpdateDateColumn()
//   updated_at!: Date;
// }

// @Entity()
// export class IntentEdge {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @ManyToOne(() => IntentNode, (intentNode) => intentNode.edges)
//   from!: IntentNode;

//   @ManyToOne(() => IntentNode, (intentNode) => intentNode.edges)
//   to!: IntentNode;

//   @CreateDateColumn()
//   created_at!: Date;

//   @UpdateDateColumn()
//   updated_at!: Date;
// }
