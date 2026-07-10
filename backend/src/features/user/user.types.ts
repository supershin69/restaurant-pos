export type UserResponseType = {
    name: string;
    email: string;
    role: 'ADMIN' | 'CASHIER',
    profilePicture: string | null;
}