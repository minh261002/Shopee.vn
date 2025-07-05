"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, User, Mail, Shield, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsFetching(true);
                const response = await api.get(`/admin/users/${id}`);
                const userData: UserType = response.data;
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Không thể tải thông tin người dùng');
                router.push('/admin/users');
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
                                        {new Date(user.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Cập nhật lần cuối
                                    </Label>
                                    <p className="text-sm">
                                        {new Date(user.updatedAt).toLocaleString('vi-VN')}
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
        </div>
    );
};

export default UserDetailPage; 