import { Role } from "../../../generated/prisma/enums.ts"

export type RegisterDTO = {
    name: string
    email: string
    role: Role
    password: string
}

export type LoginDTO = {
    email: string
    password: string
}

export type AuthResponse = {
    token: string
    user: {
        id: string
        email: string
        name: string
        role: Role
    }
}