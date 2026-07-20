export type UserResponseType = {
    name: string;
    email: string;
    role: 'ADMIN' | 'CASHIER',
    profilePicture: string | null;
}

export type MyProfileResponseType = {
    name: string;
    email: string;
    role: 'ADMIN' | 'CASHIER',
    password: string;
    profilePicture: string | null;
}