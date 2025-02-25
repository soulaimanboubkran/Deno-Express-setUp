// User.ts
import "npm:reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "npm:typeorm@0.3.20";

export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

// Add this to suppress the specific decorator warning
// @ts-ignore
@Entity('users')
export class User extends BaseEntity {
  // @ts-ignore
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @ts-ignore
  @Column({ unique: true, length: 50 })
  // @ts-ignore
  @Index()
  email!: string;

  // @ts-ignore
  @Column({ length: 50 })
  firstName!: string;

  // @ts-ignore
  @Column({ length: 50 })
  lastName!: string;

  // @ts-ignore
  @Column({ length: 50, nullable: true })
  country?: string;

  // @ts-ignore
  @Column({ type: 'int', nullable: true })
  age?: number;

  // @ts-ignore
  @Column({ nullable: false })
  password!: string;

  // @ts-ignore
  @Column({ 
    type: "enum", 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role!: UserRole;

  // @ts-ignore
  @CreateDateColumn()
  createdAt!: Date;

  // @ts-ignore
  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;

  // @ts-ignore
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // @ts-ignore
  @Column({ nullable: true })
  resetPasswordToken?: string;

  // @ts-ignore
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiresAt?: Date;

  // @ts-ignore
  @Column({ nullable: true })
  verificationToken?: string;

  // @ts-ignore
  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiresAt?: Date;

  // @ts-ignore
  @Column({ 
    type: "varchar", 
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" 
  })
  avatar?: string;
}