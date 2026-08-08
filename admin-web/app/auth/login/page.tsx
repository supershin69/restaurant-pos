"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormValues, loginSchema } from "./login.schema";
import { loginUser } from "./login";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function Login() {
    const router = useRouter();
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting }, 
        setError 
    } = useForm({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await loginUser(data);

            const result = await response.json();

            if (!response.ok) {
                setError("root", { message: result.message || "Login failed."});
                return;
            }

            console.log('Authenticated: ', result);
            router.push('/dashboard');
        } catch (error) {
            setError("root", { message: "Network error connecting to the server." });
        }
    }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center text-2xl md:text-3xl">
                    Login
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-4 py-2 px-4">
                    {
                    errors.root && (
                    <div className="font-medium text-sm text-red-500 bg-red-50">
                        {errors.root.message}
                    </div>)
                    }

                    <FieldGroup className="gap-2">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <Input id="email" type="email" {...register("email")} placeholder="youremail@example.com" className="border border-slate-300 pl-2" aria-invalid={!!errors.email} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </FieldGroup>

                    <FieldGroup className="gap-2 mb-4">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input id="password" type="password" {...register("password")} placeholder="your password" className="border border-slate-300 pl-2" aria-invalid={!!errors.password} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </FieldGroup>

                    <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <>
                            <Spinner className="mr-2"/>
                            Logging In...
                        </> : 'Log In'}
                    </Button>     
                </form>
            </CardContent>

        </Card>
    </div>
    
  )
}
export default Login