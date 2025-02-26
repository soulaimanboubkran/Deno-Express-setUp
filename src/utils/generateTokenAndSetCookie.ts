import jwt from 'npm:jsonwebtoken';
import { Response } from 'npm:express';
import { User, UserRole } from '../entity/Auth/User.ts';
import { Profile } from '../entity/Profile/Profile.ts';
 // Adjust import based on your file structure

 export const generateTokenAndSetCookie = (res: Response, userId: string , role: UserRole,profileId:string): any=> {
    try {
     console.log("JWT_SECRET during generation:", process.env.JWT_SECRET); // Debugging
     const token = jwt.sign({ userId, role,profileId }, process.env.JWT_SECRET!, {
         expiresIn: '7d',
     });

     res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     });
 
     return token;
    } catch (error) {
     console.log("Error generating token:", error);
    } 
 };
 export const generateTokenAndSetCookieBeforLogin = (res: Response, userId:string,role:UserRole,profiles:Profile[]): any=> {
    try {
     const token = jwt.sign({ userId,role,profiles}, process.env.JWT_SECRET!, {
         expiresIn: '7d',
     });

     res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     });
 
     return token;
    } catch (error) {
     console.log("Error generating token:", error);
    } 
 };
 