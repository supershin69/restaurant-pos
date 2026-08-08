"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { usePathname } from "next/navigation"

export interface User {
  name: string
  email: string
  profilePicture: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null
}

// This is sample data.
const data = [
  {
    name: "Dashboard",
    url: "/dashboard"
  },
  {
    name: "Foods",
    url: "/dashboard/foods"
  }
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathName = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {user && <NavUser user={user} />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>

                {data.map((item) => {

                  const isActive = pathName === item.url;
                  
                  return (
                  
                  <SidebarMenuItem key={item.name} >
                    <SidebarMenuButton isActive={isActive} render={<a href={item.url}>{item.name}</a>} />
                  </SidebarMenuItem>
                )}
                )}

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
