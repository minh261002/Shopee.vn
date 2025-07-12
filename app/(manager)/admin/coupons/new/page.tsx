"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { CreateCouponRequest } from '@/types/coupon';

const CreateCouponPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateCouponRequest>({
        code: '',
        name: '',
        description: '',
        type: 'PERCENTAGE',
        scope: 'PLATFORM_WIDE',
        discountValue: 0,
        minOrderAmount: undefined,
        maxDiscountAmount: undefined,
        totalLimit: undefined,
        userLimit: undefined,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        categoryIds: [],
        brandIds: [],
        storeIds: [],
        userGroupIds: [],
        isActive: true,
    });

    const handleBack = () => {
        router.back();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // Validate form data
            if (!formData.code || !formData.name) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            if (formData.startDate >= formData.endDate) {
                toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
                return;
            }

            if (formData.discountValue <= 0) {
                toast.error('Giá trị giảm giá phải lớn hơn 0');
                return;
            }

            if (formData.type === 'PERCENTAGE' && formData.discountValue > 100) {
                toast.error('Phần trăm giảm giá không được vượt quá 100%');
                return;
            }

            // Convert arrays to JSON strings for API
            const submitData = {
                ...formData,
                categoryIds: formData.categoryIds?.length ? JSON.stringify(formData.categoryIds) : undefined,
                brandIds: formData.brandIds?.length ? JSON.stringify(formData.brandIds) : undefined,
                storeIds: formData.storeIds?.length ? JSON.stringify(formData.storeIds) : undefined,
                userGroupIds: formData.userGroupIds?.length ? JSON.stringify(formData.userGroupIds) : undefined,
            };

            await api.post('/admin/coupons', submitData);
            toast.success('Tạo coupon thành công');
            router.push('/admin/coupons');
        } catch (error) {
            console.error('Error creating coupon:', error);
            toast.error('Lỗi khi tạo coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateCouponRequest, value: string | number | boolean | Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleInputChange('code', result);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'PERCENTAGE': return 'Phần trăm';
            case 'FIXED_AMOUNT': return 'Số tiền cố định';
            case 'FREE_SHIPPING': return 'Miễn phí vận chuyển';
            case 'CASHBACK': return 'Hoàn tiền';
            default: return type;
        }
    };

    const getScopeLabel = (scope: string) => {
        switch (scope) {
            case 'PLATFORM_WIDE': return 'Toàn platform';
            case 'CATEGORY': return 'Danh mục';
            case 'BRAND': return 'Thương hiệu';
            case 'FIRST_ORDER': return 'Đơn hàng đầu';
            case 'NEW_USER': return 'User mới';
            default: return scope;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tạo Coupon mới</h1>
                    <p className="text-muted-foreground">
                        Tạo mã giảm giá và khuyến mãi mới
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>
                                Thông tin chính của coupon
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Mã coupon *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                        placeholder="Nhập mã coupon"
                                        className="font-mono"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateCode}
                                    >
                                        Tạo mã
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Tên coupon *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Nhập tên coupon"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về coupon"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Loại coupon *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => handleInputChange('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
                                            <SelectItem value="FREE_SHIPPING">Miễn phí vận chuyển</SelectItem>
                                            <SelectItem value="CASHBACK">Hoàn tiền</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scope">Phạm vi *</Label>
                                    <Select
                                        value={formData.scope}
                                        onValueChange={(value) => handleInputChange('scope', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLATFORM_WIDE">Toàn platform</SelectItem>
                                            <SelectItem value="CATEGORY">Danh mục</SelectItem>
                                            <SelectItem value="BRAND">Thương hiệu</SelectItem>
                                            <SelectItem value="FIRST_ORDER">Đơn hàng đầu</SelectItem>
                                            <SelectItem value="NEW_USER">User mới</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountValue">
                                    Giá trị giảm giá *
                                    {formData.type === 'PERCENTAGE' && ' (%)'}
                                    {formData.type === 'FIXED_AMOUNT' && ' (VNĐ)'}
                                </Label>
                                <Input
                                    id="discountValue"
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '50000'}
                                    min={0}
                                    max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conditions and Limits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Điều kiện và giới hạn</CardTitle>
                            <CardDescription>
                                Thiết lập điều kiện áp dụng và giới hạn sử dụng
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="minOrderAmount">Giá trị đơn hàng tối thiểu (VNĐ)</Label>
                                <Input
                                    id="minOrderAmount"
                                    type="number"
                                    value={formData.minOrderAmount || ''}
                                    onChange={(e) => handleInputChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    placeholder="0"
                                    min={0}
                                />
                            </div>

                            {formData.type === 'PERCENTAGE' && (
                                <div className="space-y-2">
                                    <Label htmlFor="maxDiscountAmount">Giảm giá tối đa (VNĐ)</Label>
                                    <Input
                                        id="maxDiscountAmount"
                                        type="number"
                                        value={formData.maxDiscountAmount || ''}
                                        onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="Không giới hạn"
                                        min={0}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="totalLimit">Giới hạn tổng lượt sử dụng</Label>
                                <Input
                                    id="totalLimit"
                                    type="number"
                                    value={formData.totalLimit || ''}
                                    onChange={(e) => handleInputChange('totalLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Không giới hạn"
                                    min={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userLimit">Giới hạn mỗi user</Label>
                                <Input
                                    id="userLimit"
                                    type="number"
                                    value={formData.userLimit || ''}
                                    onChange={(e) => handleInputChange('userLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Không giới hạn"
                                    min={1}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                                <Label htmlFor="isActive">Kích hoạt ngay</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Period */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thời gian hiệu lực</CardTitle>
                            <CardDescription>
                                Thiết lập thời gian bắt đầu và kết thúc
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Thời gian bắt đầu *</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate.toISOString().slice(0, 16)}
                                    onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">Thời gian kết thúc *</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate.toISOString().slice(0, 16)}
                                    onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Xem trước</CardTitle>
                            <CardDescription>
                                Thông tin coupon sẽ được tạo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Mã:</span>
                                        <span className="font-mono font-bold">{formData.code || 'CHƯA CÓ'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Tên:</span>
                                        <span className="font-medium">{formData.name || 'Chưa có tên'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Loại:</span>
                                        <Badge variant="outline">{getTypeLabel(formData.type)}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Phạm vi:</span>
                                        <Badge variant="outline">{getScopeLabel(formData.scope)}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Giá trị:</span>
                                        <span className="font-bold">
                                            {formData.type === 'PERCENTAGE'
                                                ? `${formData.discountValue}%`
                                                : `${formData.discountValue.toLocaleString()}đ`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Trạng thái:</span>
                                        <Badge variant={formData.isActive ? "default" : "secondary"}>
                                            {formData.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={handleBack}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Tạo coupon
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCouponPage; 