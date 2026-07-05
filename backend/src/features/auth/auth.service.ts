import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/connect_db.ts";
import type { AuthResponse, LoginDTO, RegisterDTO } from "./auth.types.ts";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

class AuthService {
    //! Register Function
    async registerUser(data: RegisterDTO): Promise<AuthResponse> {
        const existingUser = await this.findUser(data.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                profile: {
                    create: {}
                }
            },
        });

        const token = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET, { expiresIn: '12h'});

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }

    }

    //! Login Function
    async loginUser(data: LoginDTO): Promise<AuthResponse> {
        const existingUser = await this.findUser(data.email);
        if (!existingUser) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(data.password, existingUser.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign({ userId: existingUser.id, role: existingUser.role}, JWT_SECRET, { expiresIn: '12h'});
        return {
            token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        }
    }

    //! Helper Function to Find Existing Emails
    async findUser(email: string) {
        const user = await prisma.user.findUnique({
            where: {email: email}
        });
        
        return user;
    }
}

export const authService = new AuthService();