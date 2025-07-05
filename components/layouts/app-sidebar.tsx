"use client"

import * as React from "react"
import {
  AppWindowMac,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavUser } from "@/components/layouts/nav-user"
import { authClient } from "@/lib/auth-client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: session } = authClient.useSession();

  const data = {
    user: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      avatar: session?.user?.image || "",
    },
    navMainAdmin: [
      {
        title: "Bảng điều khiển",
        url: "/admin/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Danh mục ",
        url: "/admin/categories",
        icon: AppWindowMac,
        items: [
          {
            title: "Danh sách",
            url: "/admin/categories",
          },
          {
            title: "Thêm mới",
            url: "/admin/categories/create",
          },
        ],
      }
    ],
    navMainSeller: [
      {
        title: "Bảng điều khiển",
        url: "/seller/dashboard",
        icon: SquareTerminal,
      },
    ],
  }

  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "ADMIN";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="items-center">
        <Image src="/images/logo-color.png" alt="logo" width={150} height={100} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={
          isAdmin ? data.navMainAdmin : data.navMainSeller
        } isAdmin={isAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
