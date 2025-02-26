import { Request, Response, NextFunction } from 'npm:express';

import { validationResult } from 'npm:express-validator';
import { AppDataSource } from '../../database.ts';
import { User } from '../../entity/Auth/User.ts';
import bcrypt from 'npm:bcryptjs';
import { generateTokenAndSetCookie, generateTokenAndSetCookieBeforLogin } from '../../utils/generateTokenAndSetCookie.ts';
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../../utils/emails.ts';
import { MoreThan } from 'npm:typeorm';
import crypto from "npm:crypto";
//import { Profile } from '../entity/Profile/Profile';
//import { ProfileService } from '../services/profile.service';
// import { generateTokenAndSetCookie } from 'path/to/your/tokenUtils'; // Adjust import path for your JWT utility
// import { sendVerificationEmail } from 'path/to/your/emailUtils'; // Adjust import path for your email utility

interface RegisterRequestBody {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
    userName:string;
}

export class AuthController {


    private userRepo = AppDataSource.getRepository(User);
    //private profileService = new ProfileService(); // Assuming ProfileService is already implemented

    async register(req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction): Promise<any> {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { firstName, lastName, age, email, password } = req.body;

        try {
            // Check if user already exists
            const userAlreadyExists = await this.userRepo.findOne({
                where: { email }
            });

            console.log("userAlreadyExists", userAlreadyExists);

            if (userAlreadyExists) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification token
            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

            // Create new user instance
            const user = new User();
            user.firstName = firstName;
            user.lastName = lastName;
            //user.userName = userName;
            user.age = age;
            user.email = email;
            user.password = hashedPassword;
            user.verificationToken = verificationToken;
            user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Save user to the database
            await this.userRepo.save(user);

            

            // Send verification email (optional)
            await sendVerificationEmail(user.email, verificationToken);

            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    age: user.age,
                },
            });
            
        } catch (error) {
            console.error("Registration error:", error);
            next(error);        }
    }
}