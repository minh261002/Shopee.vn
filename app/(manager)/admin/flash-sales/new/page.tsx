"use client";

import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload';

const FlashSaleNewPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bannerImage: '',
        startTime: '',
        endTime: '',
        maxQuantityPerUser: '',
        minOrderAmount: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Tên chương trình khuyến mãi là bắt buộc');
            return;
        }

        if (!formData.startTime) {
            toast.error('Thời gian bắt đầu là bắt buộc');
            return;
        }

        if (!formData.endTime) {
            toast.error('Thời gian kết thúc là bắt buộc');
            return;
        }

        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);

        if (startTime >= endTime) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                bannerImage: formData.bannerImage || undefined,
                startTime: formData.startTime,
                endTime: formData.endTime,
                maxQuantityPerUser: formData.maxQuantityPerUser ? parseInt(formData.maxQuantityPerUser) : undefined,
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
            };

            await api.post('/admin/flash-sales', payload);

            toast.success('Tạo chương trình khuyến mãi thành công');
            router.push('/admin/flash-sales');
        } catch (error) {
            console.error('Error creating flash sale:', error);
            toast.error('Lỗi khi tạo chương trình khuyến mãi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tạo Chương trình khuyến mãi Mới</h1>
                    <p className="text-muted-foreground">
                        Tạo chương trình khuyến mãi mới
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>
                                Thông tin chính của chương trình khuyến mãi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên chương trình khuyến mãi *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Nhập tên chương trình khuyến mãi"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả chương trình khuyến mãi"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Banner</Label>
                                <CloudinaryUpload
                                    value={formData.bannerImage}
                                    onChange={(url: string) => handleInputChange('bannerImage', url)}
                                    className="w-full"
                                    placeholder="Upload banner"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thời gian và quy tắc</CardTitle>
                            <CardDescription>
                                Cài đặt thời gian và quy tắc cho chương trình khuyến mãi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxQuantityPerUser">Giới hạn mỗi user</Label>
                                <Input
                                    id="maxQuantityPerUser"
                                    type="number"
                                    min="1"
                                    value={formData.maxQuantityPerUser}
                                    onChange={(e) => handleInputChange('maxQuantityPerUser', e.target.value)}
                                    placeholder="Để trống nếu không giới hạn"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Số lượng tối đa mỗi user có thể mua trong chương trình khuyến mãi này
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu</Label>
                                <Input
                                    id="minOrderAmount"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                                    placeholder="Để trống nếu không yêu cầu"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Giá trị đơn hàng tối thiểu để áp dụng chương trình khuyến mãi (VNĐ)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? 'Đang tạo...' : 'Tạo chương trình khuyến mãi'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default FlashSaleNewPage; 