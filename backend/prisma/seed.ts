import { authService } from "../src/features/auth/auth.service.ts";
import prisma from "../src/db/connect_db.ts";
import type { RegisterDTO } from "../src/features/auth/auth.types.ts";
import prompts from "prompts";
import { registerSchema } from "../src/features/auth/auth.schema.ts";

async function seedUser() {
    console.log("Seeding users...");

    const existingAdmin = await prisma.user.findFirst({
        where: {
            role: "ADMIN"
        }
    });

    if (existingAdmin) {
        console.log("An admin account already exists.");
        console.log("Seeding aborted to prevent unauthorized admin account creation...");
        //console.log("For testing purposes, we will let you create admin account...");
        return;
    }

    console.log("No admin found. Please configure the initial admin account:");

    const response = await prompts([
        {
            type: 'text',
            name: 'name',
            message: 'Enter admin name:',
            validate: (value) =>
                registerSchema.shape.name.safeParse(value).success
                    ? true
                    : "Name cannot be empty",
            initial: 'Admin'
        },
        {
            type: 'text',
            name: 'email',
            message: 'Enter admin email:',
            validate: value => registerSchema.shape.email.safeParse(value).success ? true : 'Please enter a valid email address'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter admin password (input will be hidden):',
            validate: (value) =>
                registerSchema.shape.password.safeParse(value).success
                    ? true
                    : "Password must be at least 8 characters long"
        }
    ], 
    {
        onCancel: () => {
            console.log("\nSetup cancelled.");
            process.exit(0);

        }
    });

    if (!response.email || !response.name || !response.password) {
        console.log("Seeding cancelled... Missing required fields...");
        return;
    }

    const adminData: RegisterDTO = {
        name: response.name,
        email: response.email,
        role: "ADMIN",
        password: response.password
    };

    try {
        const newAdmin = await authService.registerUser(adminData);
        console.log(`✅ Admin created successfully: ${newAdmin.user.email}`);
    } catch (error) {
        console.error("❌ Failed to create admin:", error);
    }
}

seedUser()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Properly disconnect the Prisma adapter
        await prisma.$disconnect();
    });