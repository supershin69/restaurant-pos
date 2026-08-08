import z from "zod";

export const loginSchema = z.object({
    email: z
    .string({ error: 'Email is required' })
    .email('Please enter a valid email address'),
    
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
    
});

export type LoginFormValues = z.infer<typeof loginSchema>