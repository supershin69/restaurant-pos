import { apiFetch } from "@/app/lib/api";
import { LoginFormValues } from "./login.schema";

export async function loginUser(data: LoginFormValues) {
        const response = await apiFetch('/auth/login', {
            method: "POST",
            body: JSON.stringify(data),
        });

        return response;
   
}