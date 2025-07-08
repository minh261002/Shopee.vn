"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Calendar, Target, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema } from '@/validations/campaign';
import type { CampaignFormData } from '@/validations/campaign';

const CreateCampaignPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CampaignFormData>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'DRAFT',
            startDate: '',
            endDate: '',
            budget: undefined,
            targetImpressions: undefined,
            targetClicks: undefined,
            targetConversions: undefined,
            targetRevenue: undefined,
            targetAudience: 'ALL_USERS',
            geographicTarget: 'ALL_VIETNAM',
            targetLocations: '',
            targetDevices: '',
            targetCategories: '',
            conditions: '',
            campaignType: undefined,
            isFeatured: false,
        },
    });

    const watchedValues = watch();

    const onSubmit = async (data: CampaignFormData) => {
        try {
            setIsLoading(true);
            await api.post('/admin/campaigns', data);
            toast.success('Tạo chiến dịch thành công');
            router.push('/admin/campaigns');
        } catch (error) {
            console.error('Error creating campaign:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tạo chiến dịch mới</h1>
                    <p className="text-muted-foreground">
                        Tạo chiến dịch marketing và quảng cáo mới
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Thông tin cơ bản
                                </CardTitle>
                                <CardDescription>
                                    Thông tin chính của chiến dịch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên chiến dịch *</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        placeholder="Nhập tên chiến dịch"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Mô tả chiến dịch"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="campaignType">Loại chiến dịch</Label>
                                    <Select
                                        value={watchedValues.campaignType}
                                        onValueChange={(value) => setValue('campaignType', value as CampaignFormData['campaignType'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại chiến dịch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                                            <SelectItem value="SEASONAL">Theo mùa</SelectItem>
                                            <SelectItem value="BRAND">Thương hiệu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.campaignType && (
                                        <p className="text-sm text-red-500">{errors.campaignType.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={watchedValues.status}
                                        onValueChange={(value) => setValue('status', value as CampaignFormData['status'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                            <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                                            <SelectItem value="SCHEDULED">Lên lịch</SelectItem>
                                            <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                                            <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thời gian và ngân sách */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Thời gian và ngân sách
                                </CardTitle>
                                <CardDescription>
                                    Thiết lập thời gian chạy và ngân sách
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        {...register('startDate')}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-500">{errors.startDate.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        {...register('endDate')}
                                    />
                                    {errors.endDate && (
                                        <p className="text-sm text-red-500">{errors.endDate.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget">Ngân sách (VND)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        {...register('budget', { valueAsNumber: true })}
                                        placeholder="Nhập ngân sách"
                                    />
                                    {errors.budget && (
                                        <p className="text-sm text-red-500">{errors.budget.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetRevenue">Mục tiêu doanh thu (VND)</Label>
                                    <Input
                                        id="targetRevenue"
                                        type="number"
                                        {...register('targetRevenue', { valueAsNumber: true })}
                                        placeholder="Nhập mục tiêu doanh thu"
                                    />
                                    {errors.targetRevenue && (
                                        <p className="text-sm text-red-500">{errors.targetRevenue.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Đối tượng mục tiêu */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Đối tượng mục tiêu
                                </CardTitle>
                                <CardDescription>
                                    Thiết lập đối tượng và khu vực mục tiêu
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="targetAudience">Đối tượng</Label>
                                    <Select
                                        value={watchedValues.targetAudience}
                                        onValueChange={(value) => setValue('targetAudience', value as CampaignFormData['targetAudience'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL_USERS">Tất cả người dùng</SelectItem>
                                            <SelectItem value="NEW_USERS">Người dùng mới</SelectItem>
                                            <SelectItem value="RETURNING_USERS">Người dùng quay lại</SelectItem>
                                            <SelectItem value="PREMIUM_USERS">Người dùng cao cấp</SelectItem>
                                            <SelectItem value="MOBILE_USERS">Người dùng mobile</SelectItem>
                                            <SelectItem value="DESKTOP_USERS">Người dùng desktop</SelectItem>
                                            <SelectItem value="SPECIFIC_LOCATION">Vị trí cụ thể</SelectItem>
                                            <SelectItem value="SPECIFIC_DEVICE">Thiết bị cụ thể</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.targetAudience && (
                                        <p className="text-sm text-red-500">{errors.targetAudience.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="geographicTarget">Khu vực</Label>
                                    <Select
                                        value={watchedValues.geographicTarget}
                                        onValueChange={(value) => setValue('geographicTarget', value as CampaignFormData['geographicTarget'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL_VIETNAM">Toàn Việt Nam</SelectItem>
                                            <SelectItem value="NORTH_VIETNAM">Miền Bắc</SelectItem>
                                            <SelectItem value="CENTRAL_VIETNAM">Miền Trung</SelectItem>
                                            <SelectItem value="SOUTH_VIETNAM">Miền Nam</SelectItem>
                                            <SelectItem value="HANOI">Hà Nội</SelectItem>
                                            <SelectItem value="HO_CHI_MINH">TP. Hồ Chí Minh</SelectItem>
                                            <SelectItem value="DA_NANG">Đà Nẵng</SelectItem>
                                            <SelectItem value="SPECIFIC_CITY">Thành phố cụ thể</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.geographicTarget && (
                                        <p className="text-sm text-red-500">{errors.geographicTarget.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetLocations">Vị trí cụ thể</Label>
                                    <Input
                                        id="targetLocations"
                                        {...register('targetLocations')}
                                        placeholder="Nhập vị trí cụ thể (JSON)"
                                    />
                                    {errors.targetLocations && (
                                        <p className="text-sm text-red-500">{errors.targetLocations.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetDevices">Thiết bị mục tiêu</Label>
                                    <Input
                                        id="targetDevices"
                                        {...register('targetDevices')}
                                        placeholder="Nhập thiết bị mục tiêu (JSON)"
                                    />
                                    {errors.targetDevices && (
                                        <p className="text-sm text-red-500">{errors.targetDevices.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Cài đặt nâng cao */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Mục tiêu chiến dịch */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Mục tiêu chiến dịch
                                </CardTitle>
                                <CardDescription>
                                    Thiết lập các mục tiêu KPI
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="targetImpressions">Mục tiêu hiển thị</Label>
                                    <Input
                                        id="targetImpressions"
                                        type="number"
                                        {...register('targetImpressions', { valueAsNumber: true })}
                                        placeholder="Nhập mục tiêu hiển thị"
                                    />
                                    {errors.targetImpressions && (
                                        <p className="text-sm text-red-500">{errors.targetImpressions.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetClicks">Mục tiêu click</Label>
                                    <Input
                                        id="targetClicks"
                                        type="number"
                                        {...register('targetClicks', { valueAsNumber: true })}
                                        placeholder="Nhập mục tiêu click"
                                    />
                                    {errors.targetClicks && (
                                        <p className="text-sm text-red-500">{errors.targetClicks.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetConversions">Mục tiêu chuyển đổi</Label>
                                    <Input
                                        id="targetConversions"
                                        type="number"
                                        {...register('targetConversions', { valueAsNumber: true })}
                                        placeholder="Nhập mục tiêu chuyển đổi"
                                    />
                                    {errors.targetConversions && (
                                        <p className="text-sm text-red-500">{errors.targetConversions.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="conditions">Điều kiện hiển thị</Label>
                                    <Textarea
                                        id="conditions"
                                        {...register('conditions')}
                                        placeholder="Nhập điều kiện hiển thị (JSON)"
                                        rows={3}
                                    />
                                    {errors.conditions && (
                                        <p className="text-sm text-red-500">{errors.conditions.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt nâng cao</CardTitle>
                                <CardDescription>
                                    Các tùy chọn bổ sung cho chiến dịch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Chiến dịch nổi bật</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Hiển thị chiến dịch ở vị trí nổi bật
                                        </p>
                                    </div>
                                    <Switch
                                        checked={watchedValues.isFeatured}
                                        onCheckedChange={(checked) => setValue('isFeatured', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetCategories">Danh mục mục tiêu</Label>
                                    <Input
                                        id="targetCategories"
                                        {...register('targetCategories')}
                                        placeholder="Nhập danh mục mục tiêu (JSON)"
                                    />
                                    {errors.targetCategories && (
                                        <p className="text-sm text-red-500">{errors.targetCategories.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Tạo chiến dịch
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                                    Hủy
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaignPage; 