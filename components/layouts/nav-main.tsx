"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openItem, setOpenItem] = useState<string | null>(null)

  // Helper to parse url into pathname and query
  function parseUrl(url: string) {
    const [path, query] = url.split("?");
    return { path, query };
  }

  // Custom active check for inventory subitems
  function isInventorySubActive(subItem: { url: string }) {
    const { path, query } = parseUrl(subItem.url);
    if (!subItem.url.startsWith("/seller/inventory")) return false;
    if (query) {
      // Check if current pathname matches and all query params match
      if (pathname !== path) return false;
      const urlParams = new URLSearchParams(query);
      for (const [key, value] of urlParams.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    } else {
      // No query, just match pathname
      return pathname === path && !searchParams.get("tab");
    }
  }

  const isActiveUrl = (url: string) => {
    // Default: match pathname only
    return pathname === url;
  }

  const hasActiveChild = (item: typeof items[0]) => {
    // For inventory: use custom logic
    if (item.url.startsWith("/seller/inventory")) {
      return item.items?.some(isInventorySubActive);
    }
    // Default: match pathname
    return item.items?.some(subItem => pathname === subItem.url);
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isActiveUrl(item.url)
          const hasChildren = item.items && item.items.length > 0
          const isParentActive = hasChildren && hasActiveChild(item)

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openItem === item.title || isParentActive}
              onOpenChange={(isOpen) => {
                setOpenItem(isOpen ? item.title : null)
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(isParentActive && "text-primary")}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      // Custom active for inventory
                      const isSubActive = item.url.startsWith("/seller/inventory")
                        ? isInventorySubActive(subItem)
                        : isActiveUrl(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              isSubActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            )}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
