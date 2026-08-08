import { apiFetch } from "./api";

export async function logout() {
    await apiFetch('/auth/logout', {
        method: "POST"
    });
}