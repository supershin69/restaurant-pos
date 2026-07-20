import { authService } from "../src/features/auth/auth.service.ts";
import prisma from "../src/db/connect_db.ts";
import type { RegisterDTO } from "../src/features/auth/auth.types.ts";
async function seedUser() {
    console.log("Seeding users...");
    const adminData: RegisterDTO = {
        name: "Shin Thant Aung",
        email: "zikeciping12@gmail.com",
        role: "ADMIN",
        password: "admin12345678"
    };

    const newAdmin = await authService.registerUser(adminData);

    console.log(`Admin created successfully: ${newAdmin.user.email}`);
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