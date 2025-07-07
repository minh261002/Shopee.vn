
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { Link, LogOutIcon, SettingsIcon, StoreIcon, UserIcon } from "lucide-react"
import { useSignOut } from "@/hooks/use-signout"
import { authClient } from "@/lib/auth-client"
import type { DefaultSession } from "better-auth"

interface UserInfoProps {
    name: string
    email: string
    image: string
}

const UserInfo = ({ name, email, image }: UserInfoProps) => {
    const { handleSignOut } = useSignOut()
    const { data: session } = authClient.useSession();
    const role = (session?.user as DefaultSession['user'])?.role;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    <UserIcon className="w-4 h-4" />
                    <span>{name || email}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{name}</span>
                            <span className="truncate text-xs">{email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === 'SELLER' && (
                    <DropdownMenuItem className="cursor-pointer">
                        <Link href="/seller/dashboard">
                            <StoreIcon className="w-4 h-4" />
                            Quản lý cửa hàng
                        </Link>
                    </DropdownMenuItem>
                )}
                {role === 'ADMIN' && (
                    <DropdownMenuItem className="cursor-pointer">
                        <Link href="/admin/dashboard">
                            <SettingsIcon className="w-4 h-4" />
                            Quản trị hệ thống
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOutIcon className="w-4 h-4" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserInfo;