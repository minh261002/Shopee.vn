"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, User, Mail, Shield, Calendar, Loader2, AlertCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import Image from 'next/image';
import { use } from 'react';
import { Label } from '@/components/ui/label';
import type { UserData as UserType } from '@/types/user';
import AddressManager from '@/components/user/address-manager';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Store, Phone, Globe, MapPin, Building2, FileText, BarChart3, Star, Users, ShoppingBag, DollarSign } from 'lucide-react';


const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsFetching(true);
                const response = await api.get(`/admin/users/${id}`);
                const userData: UserType = response.data;
                setUser(userData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            } finally {
                setIsFetching(false);
            }
        };

        fetchUser();
    }, [id, router]);

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await api.delete(`/admin/users/${id}`);
            toast.success('Xóa người dùng thành công');
            router.push('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/admin/users/${id}/edit`);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge variant="default">Quản trị viên</Badge>;
            case 'SELLER':
                return <Badge variant="secondary">Chủ cửa hàng</Badge>;
            case 'USER':
                return <Badge variant="outline">Khách hàng</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Đang tải thông tin người dùng...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500">{error}</div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-muted-foreground">Không tìm thấy người dùng</p>
                    <Button onClick={() => router.push('/admin/users')} className="mt-4">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const store = user.stores[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleEdit} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa người dùng &quot;{user.name}&quot;?
                                    Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang xóa...' : 'Xóa người dùng'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Cảnh báo</AlertTitle>
                <AlertDescription>
                    Việc xóa người dùng sẽ xóa tất cả dữ liệu liên quan bao gồm phiên đăng nhập,
                    tài khoản liên kết và địa chỉ. Hành động này không thể hoàn tác.
                    Vui lòng cân nhắc kỹ trước khi xóa.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-lg font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{user.name}</h3>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getRoleBadge(user.role)}
                                        {user.emailVerified ? (
                                            <Badge variant="default" className="bg-green-500">
                                                <Mail className="h-3 w-3 mr-1" />
                                                Đã xác thực
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                <Mail className="h-3 w-3 mr-1" />
                                                Chưa xác thực
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Thông tin thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Ngày tạo
                                    </Label>
                                    <p className="text-sm">
                                        {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Cập nhật lần cuối
                                    </Label>
                                    <p className="text-sm">
                                        {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 h-fit">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Thống kê
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Phiên đăng nhập</span>
                                    <Badge variant="outline">{user._count?.sessions || 0}</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Tài khoản liên kết</span>
                                    <Badge variant="outline">{user._count?.accounts || 0}</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Địa chỉ</span>
                                    <Badge variant="outline">{user._count?.addresses || 0}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Address Manager */}
            <AddressManager userId={id} />

            {/* Store Info */}
            {store && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            <CardTitle>Thông tin cửa hàng</CardTitle>
                        </div>
                        <CardDescription>Chi tiết cửa hàng của người dùng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Tên cửa hàng</p>
                                <p className="text-lg">{store.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Loại hình</p>
                                <Badge>{store.type}</Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Trạng thái</p>
                                <Badge
                                    variant={
                                        store.status === 'ACTIVE' ? 'default' :
                                            store.status === 'PENDING_APPROVAL' ? 'secondary' :
                                                store.status === 'SUSPENDED' ? 'destructive' :
                                                    'outline'
                                    }
                                >
                                    {store.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Xác thực</p>
                                <Badge
                                    variant={
                                        store.verificationStatus === 'VERIFIED' ? 'default' :
                                            store.verificationStatus === 'PENDING' ? 'secondary' :
                                                store.verificationStatus === 'REJECTED' ? 'destructive' :
                                                    'outline'
                                    }
                                >
                                    {store.verificationStatus}
                                </Badge>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Thông tin liên hệ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <Mail className="w-4 h-4" /> Email
                                    </p>
                                    <p>{store.email || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <Phone className="w-4 h-4" /> Điện thoại
                                    </p>
                                    <p>{store.phone || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <Globe className="w-4 h-4" /> Website
                                    </p>
                                    <p>{store.website || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Địa chỉ
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                <p className="text-sm font-medium">Địa chỉ chi tiết</p>
                                <p>{store.address}</p>
                            </div>
                        </div>

                        {/* Business Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Thông tin doanh nghiệp
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Tên doanh nghiệp</p>
                                    <p>{store.businessName || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Địa chỉ doanh nghiệp</p>
                                    <p>{store.businessAddress || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Mã số thuế</p>
                                    <p>{store.taxCode || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Giấy phép kinh doanh</p>
                                    <p>{store.businessLicense || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Chính sách cửa hàng
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Chính sách đổi trả</p>
                                    <p className="whitespace-pre-wrap">{store.returnPolicy || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Chính sách vận chuyển</p>
                                    <p className="whitespace-pre-wrap">{store.shippingPolicy || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Thống kê
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-secondary/10 rounded-lg">
                                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                        <Star className="w-4 h-4" />
                                        Đánh giá
                                    </p>
                                    <p className="text-xl font-semibold">{store.rating.toFixed(1)}/5</p>
                                    <p className="text-sm text-muted-foreground">({store.reviewCount} đánh giá)</p>
                                </div>
                                <div className="p-4 bg-secondary/10 rounded-lg">
                                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                        <Users className="w-4 h-4" />
                                        Người theo dõi
                                    </p>
                                    <p className="text-xl font-semibold">{store.followerCount}</p>
                                </div>
                                <div className="p-4 bg-secondary/10 rounded-lg">
                                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Sản phẩm & Đơn hàng
                                    </p>
                                    <p className="text-xl font-semibold">{store.totalProducts}</p>
                                    <p className="text-sm text-muted-foreground">({store.totalOrders} đơn)</p>
                                </div>
                                <div className="p-4 bg-secondary/10 rounded-lg">
                                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                        <DollarSign className="w-4 h-4" />
                                        Doanh thu
                                    </p>
                                    <p className="text-xl font-semibold">{store.totalRevenue.toLocaleString('vi-VN')}đ</p>
                                </div>
                            </div>
                        </div>

                        {/* Store Images */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Hình ảnh cửa hàng
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Logo</p>
                                    {store.logo ? (
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                            <Image
                                                src={store.logo}
                                                alt="Store logo"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-secondary/10 rounded-lg flex items-center justify-center">
                                            <Store className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2">Banner</p>
                                    {store.banner ? (
                                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                            <Image
                                                src={store.banner}
                                                alt="Store banner"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-secondary/10 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Store Timestamps */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Thời gian
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Ngày tạo</p>
                                    <p>{format(new Date(store.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Cập nhật lần cuối</p>
                                    <p>{format(new Date(store.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Store Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                Trạng thái hoạt động
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Hoạt động</p>
                                    <Badge variant={store.isActive ? 'default' : 'secondary'}>
                                        {store.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Nổi bật</p>
                                    <Badge variant={store.isFeatured ? 'default' : 'secondary'}>
                                        {store.isFeatured ? 'Có' : 'Không'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Xác thực</p>
                                    <Badge variant={store.isVerified ? 'default' : 'secondary'}>
                                        {store.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Cửa hàng chính thức</p>
                                    <Badge variant={store.isOfficialStore ? 'default' : 'secondary'}>
                                        {store.isOfficialStore ? 'Có' : 'Không'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Mạng xã hội
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Facebook</p>
                                    {store.facebookUrl ? (
                                        <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {store.facebookUrl}
                                        </a>
                                    ) : (
                                        <p>Chưa cập nhật</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Instagram</p>
                                    {store.instagramUrl ? (
                                        <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {store.instagramUrl}
                                        </a>
                                    ) : (
                                        <p>Chưa cập nhật</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Youtube</p>
                                    {store.youtubeUrl ? (
                                        <a href={store.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {store.youtubeUrl}
                                        </a>
                                    ) : (
                                        <p>Chưa cập nhật</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default UserDetailPage; 