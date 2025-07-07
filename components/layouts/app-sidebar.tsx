"use client"

import * as React from "react"
import {
  AppWindowMac,
  SquareTerminal,
  Users,
  Target,
  Store,
  Package,
  ShoppingCart,
  Warehouse,
  Percent,
  BarChart3,
  Settings,
  Star,
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
        title: "Cửa hàng",
        url: "/admin/stores",
        icon: Store,
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
            url: "/admin/categories/new",
          },
        ]
      },
      {
        title: "Banner",
        url: "/admin/banners",
        icon: AppWindowMac,
        items: [
          {
            title: "Danh sách",
            url: "/admin/banners",
          },
          {
            title: "Thêm mới",
            url: "/admin/banners/new",
          },
        ]
      },
      {
        title: "Chiến dịch",
        url: "/admin/campaigns",
        icon: Target,
        items: [
          {
            title: "Danh sách",
            url: "/admin/campaigns",
          },
          {
            title: "Thêm mới",
            url: "/admin/campaigns/new",
          },
        ]
      },
      {
        title: "Tài khoản",
        url: "/admin/users",
        icon: Users,
        items: [
          {
            title: "Danh sách",
            url: "/admin/users",
          },
          {
            title: "Thêm mới",
            url: "/admin/users/new",
          },
        ]
      }
    ],
    navMainSeller: [
      {
        title: "Bảng điều khiển",
        url: "/seller/dashboard",
        icon: SquareTerminal,
      },
      {
        title: "Sản phẩm",
        url: "/seller/products",
        icon: Package,
        items: [
          {
            title: "Danh sách",
            url: "/seller/products",
          },
          {
            title: "Thêm mới",
            url: "/seller/products/new",
          },
        ]
      },
      {
        title: "Đơn hàng",
        url: "/seller/orders",
        icon: ShoppingCart,
      },
      {
        title: "Kho hàng",
        url: "/seller/inventory",
        icon: Warehouse,
      },
      {
        title: "Khuyến mãi",
        url: "/seller/promotions",
        icon: Percent,
        items: [
          {
            title: "Danh sách",
            url: "/seller/promotions",
          },
          {
            title: "Tạo khuyến mãi",
            url: "/seller/promotions/new",
          },
        ]
      },
      {
        title: "Thống kê",
        url: "/seller/analytics",
        icon: BarChart3,
      },
      {
        title: "Đánh giá",
        url: "/seller/reviews",
        icon: Star,
      },
      {
        title: "Cài đặt",
        url: "/seller/settings",
        icon: Settings,
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
        } />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
