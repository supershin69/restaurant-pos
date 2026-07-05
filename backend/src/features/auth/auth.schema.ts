import { z } from "zod";
import { Role } from "../../../generated/prisma/enums.ts";

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters long'),
    
  email: z
    .string({ error: 'Email is required' })
    .email('Please enter a valid email address'),
    
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
    
  role: z.nativeEnum(Role, {
    error: "Role must be either 'ADMIN' or 'CASHIER'"
  }),
});