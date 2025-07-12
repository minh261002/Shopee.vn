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
  Bell,
  HelpCircle,
  Truck,
  Ticket,
  Video,
  Zap,
  UserCheck,
  FileText,
  DollarSign,
  MessageSquare,
} from "lucide-react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavUser } from "@/components/layouts/nav-user"
import { authClient } from "@/lib/auth-client"
import { StoreSwitcher } from "@/components/layouts/store-switcher"

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
      },
      {
        title: "Vận chuyển",
        url: "/admin/shipping",
        icon: Truck,
        items: [
          {
            title: "Nhà vận chuyển",
            url: "/admin/shipping/providers",
          },
          {
            title: "Biểu giá",
            url: "/admin/shipping/rates",
          },
        ]
      },
      {
        title: "Coupon",
        url: "/admin/coupons",
        icon: Ticket,
        items: [
          {
            title: "Danh sách",
            url: "/admin/coupons",
          },
          {
            title: "Thêm mới",
            url: "/admin/coupons/new",
          },
        ]
      },
      {
        title: "Flash Sale",
        url: "/admin/flash-sales",
        icon: Zap,
        items: [
          {
            title: "Danh sách",
            url: "/admin/flash-sales",
          },
          {
            title: "Thêm mới",
            url: "/admin/flash-sales/new",
          },
        ]
      },
      {
        title: "Affiliate",
        url: "/admin/affiliates",
        icon: UserCheck,
        items: [
          {
            title: "Danh sách",
            url: "/admin/affiliates",
          },
          {
            title: "Hoa hồng",
            url: "/admin/affiliates/commissions",
          },
        ]
      },
      {
        title: "Hỗ trợ",
        url: "/admin/support",
        icon: HelpCircle,
        items: [
          {
            title: "FAQ",
            url: "/admin/support/faq",
          },
          {
            title: "Tickets",
            url: "/admin/support/tickets",
          },
        ]
      },
      {
        title: "Thông báo",
        url: "/admin/notifications",
        icon: Bell,
        items: [
          {
            title: "Templates",
            url: "/admin/notifications/templates",
          },
          {
            title: "Gửi thông báo",
            url: "/admin/notifications/send",
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
        title: "Livestream",
        url: "/seller/livestream",
        icon: Video,
        items: [
          {
            title: "Danh sách",
            url: "/seller/livestream",
          },
          {
            title: "Tạo mới",
            url: "/seller/livestream/new",
          },
        ]
      },
      {
        title: "Khuyến mãi Flash Sale",
        url: "/seller/flash-sales",
        icon: Zap,
        items: [
          {
            title: "Danh sách",
            url: "/seller/flash-sales",
          },
          {
            title: "Đăng ký tham gia",
            url: "/seller/flash-sales/register",
          },
        ]
      },
      {
        title: "Affiliate",
        url: "/seller/affiliate",
        icon: UserCheck,
        items: [
          {
            title: "Links",
            url: "/seller/affiliate/links",
          },
          {
            title: "Hoa hồng",
            url: "/seller/affiliate/commissions",
          },
        ]
      },
      {
        title: "Hỗ trợ",
        url: "/seller/support",
        icon: HelpCircle,
        items: [
          {
            title: "Tickets",
            url: "/seller/support/tickets",
          },
          {
            title: "Tạo ticket",
            url: "/seller/support/new",
          },
        ]
      },
      {
        title: "Tài chính",
        url: "/seller/finance",
        icon: DollarSign,
        items: [
          {
            title: "Thanh toán",
            url: "/seller/finance/payments",
          },
          {
            title: "Rút tiền",
            url: "/seller/finance/withdrawals",
          },
        ]
      },
      {
        title: "Vận chuyển",
        url: "/seller/shipping",
        icon: Truck,
        items: [
          {
            title: "Đơn hàng",
            url: "/seller/shipping/orders",
          },
          {
            title: "Cài đặt",
            url: "/seller/shipping/settings",
          },
        ]
      },
      {
        title: "Thông báo",
        url: "/seller/notifications",
        icon: Bell,
      },
      {
        title: "Tin nhắn",
        url: "/seller/messages",
        icon: MessageSquare,
      },
      {
        title: "Tài liệu",
        url: "/seller/documents",
        icon: FileText,
        items: [
          {
            title: "Hướng dẫn",
            url: "/seller/documents/guides",
          },
          {
            title: "Chính sách",
            url: "/seller/documents/policies",
          },
        ]
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
        {!isAdmin && <StoreSwitcher />}
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
