"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Shield, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload';
import { use } from 'react';
import type { UserData, UpdateUserRequest } from '@/types/user';
import AddressManager from '@/components/user/address-manager';

const EditUserPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<UpdateUserRequest>({
        name: '',
        email: '',
        role: 'USER',
        image: '',
        emailVerified: false,
    });

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsFetching(true);
                const response = await api.get(`/admin/users/${id}`);
                const userData: UserData = response.data;
                setUser(userData);
                setFormData({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    image: userData.image || '',
                    emailVerified: userData.emailVerified,
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Không thể tải thông tin tài khoản');
                router.push('/admin/users');
            } finally {
                setIsFetching(false);
            }
        };

        fetchUser();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setIsLoading(true);
            await api.put(`/admin/users/${id}`, formData);
            toast.success('Cập nhật tài khoản thành công');
            router.push('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Đang tải thông tin tài khoản...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-muted-foreground">Không tìm thấy tài khoản</p>
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
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Chỉnh sửa thông tin tài khoản</h1>
                    <p className="text-muted-foreground">
                        Cập nhật thông tin tài khoản
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Thông tin tài khoản
                                </CardTitle>
                                <CardDescription>
                                    Cập nhật thông tin cơ bản của tài khoản
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Họ và tên *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Nhập họ và tên"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Vai trò *</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value: 'USER' | 'SELLER' | 'ADMIN') =>
                                            setFormData(prev => ({ ...prev, role: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Khách hàng
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="SELLER">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Chủ cửa hàng
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ADMIN">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Quản trị viên
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="emailVerified"
                                        checked={formData.emailVerified}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({ ...prev, emailVerified: checked }))
                                        }
                                    />
                                    <Label htmlFor="emailVerified">Email đã xác thực</Label>
                                </div>

                                {/* Address Manager */}
                                <AddressManager userId={id} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Ảnh đại diện
                                </CardTitle>
                                <CardDescription>
                                    Tải lên ảnh đại diện cho tài khoản
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CloudinaryUpload
                                    onChange={handleImageUpload}
                                    value={formData.image}
                                    folder="users"
                                    className="w-full"
                                />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="w-1/2"
                                    disabled={isLoading}
                                    onClick={handleSubmit}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật tài khoản'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-1/2"
                                    onClick={() => router.back()}
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditUserPage; 