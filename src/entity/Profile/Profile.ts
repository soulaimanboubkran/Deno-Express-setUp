import "npm:reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "npm:typeorm@0.3.20";

import { User } from '../Auth/User.ts';
//import { Post } from '../Post/Post';
//import { Follow } from '../Follow/Follow';
//import { Like } from '../Like/Like';
//

export enum ProfileType {
    NORMAL = "normal",
    BUSINESS = "business",
}

@Entity('profiles')
export class Profile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ length: 50,nullable:true,unique:true })
    profileName: string;

    @Column({
        type: "enum",
        enum: ProfileType,
        default: ProfileType.NORMAL,
    })
    type: ProfileType;

    @Column({ nullable: true })
    businessName?: string; // Only applicable for business profiles

    @ManyToOne(() => User, (user) => user.profiles)
    user: User;

    @Column("simple-array", { nullable: true })
    associateIds?: string[]; // List of associated user IDs for business profiles



    @Column({ type: 'timestamp', nullable: true })
    lastLogin?: Date; // Timestamp of the last login

   // @OneToMany(() => Post, (post) => post.author)
   // posts: Post[];
   // @OneToMany(() => Follow, (follow) => follow.follower)
   // followings: Follow[]; // Profiles this profile is following
//
   // @OneToMany(() => Follow, (follow) => follow.following)
   // followers: Follow[]; // Profiles following this profile
   // @OneToMany(() => Like, (like) => like.profile)
   // likes: Like[];

    @Column({
        type: "varchar",

        default:"https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    })
    avatar?: string;
  
    @Column({ default: 0 })
    totalFollowers: number;

    @Column({ default: 0 })
    totalFollowings: number;
    
    @Column({ default: true})
    isActive: boolean;//active after email verification

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn({nullable:true})
    updatedAt: Date;
    @DeleteDateColumn({nullable:true})
    deletedAt: Date;//for soft delete
}
