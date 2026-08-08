"use client"

import { Button } from "@/components/ui/button"
import { logout } from "../lib/logout"
import { useRouter } from "next/navigation";

function Dashboard() {
    const router = useRouter();
    const handleLogout = async () => {
        await logout();

        router.push('/auth/login');
        
    }
  return (
    <Button onClick={handleLogout} className="w-fit">Logout</Button>
  )
}
export default Dashboard