"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Shield, Image as ImageIcon, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload';
import type { CreateUserRequest } from '@/types/user';
import AddressPicker from '@/components/ui/address-picker';

const AddUserPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserRequest & {
        addresses: Array<{
            address: string;
            type: 'HOME' | 'WORK' | 'OTHER';
            lat?: number;
            lng?: number;
            isDefault: boolean;
        }>
    }>({
        name: '',
        email: '',
        role: 'USER',
        image: '',
        addresses: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/admin/users', formData);
            toast.success('Thêm người dùng thành công');
            router.push('/admin/users');
        } catch (error) {
            console.error('Error creating user:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Thêm người dùng mới</h1>
                    <p className="text-muted-foreground">
                        Tạo tài khoản người dùng mới trong hệ thống
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
                                    Thông tin người dùng
                                </CardTitle>
                                <CardDescription>
                                    Điền thông tin cơ bản của người dùng
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Tên người dùng *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Nhập tên người dùng"
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
                                                    <ShoppingBag className="h-4 w-4" />
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

                                <div className="space-y-2">
                                    <Label>Địa chỉ (tùy chọn)</Label>
                                    <div className="space-y-4">
                                        {formData.addresses.map((address, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-medium">Địa chỉ {index + 1}</h4>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newAddresses = formData.addresses.filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, addresses: newAddresses }));
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                                <AddressPicker
                                                    value={address}
                                                    onChange={(value) => {
                                                        const newAddresses = [...formData.addresses];
                                                        newAddresses[index] = {
                                                            address: value.address,
                                                            type: value.type || 'HOME',
                                                            lat: value.lat,
                                                            lng: value.lng,
                                                            isDefault: value.isDefault || false
                                                        };
                                                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                                                    }}
                                                    placeholder="Chọn địa chỉ"
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    addresses: [...prev.addresses, {
                                                        address: '',
                                                        type: 'HOME',
                                                        isDefault: false
                                                    }]
                                                }));
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Thêm địa chỉ
                                        </Button>
                                    </div>
                                </div>
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
                                    Tải lên ảnh đại diện cho người dùng
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
                            <CardContent className="pt-6">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddUserPage; 