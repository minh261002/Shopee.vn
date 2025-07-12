"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import type { Coupon } from '@/types/coupon';

// Patch local type for formData
interface EditCouponForm {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: string;
    scope: string;
    discountValue: string | number;
    minOrderAmount: string | number;
    maxDiscountAmount: string | number;
    totalLimit: string | number;
    userLimit: string | number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const EditCouponPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState<EditCouponForm>({
        id: '',
        code: '',
        name: '',
        description: '',
        type: 'PERCENTAGE',
        scope: 'PLATFORM_WIDE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        totalLimit: '',
        userLimit: '',
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
    });

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                setIsFetching(true);
                const response = await api.get(`/admin/coupons/${id}`);
                const coupon: Coupon = response.data;
                setFormData({
                    id: coupon.id,
                    code: coupon.code || '',
                    name: coupon.name || '',
                    description: coupon.description || '',
                    type: coupon.type || 'PERCENTAGE',
                    scope: coupon.scope || 'PLATFORM_WIDE',
                    discountValue: coupon.discountValue !== null && coupon.discountValue !== undefined ? coupon.discountValue : '',
                    minOrderAmount: coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined ? coupon.minOrderAmount : '',
                    maxDiscountAmount: coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined ? coupon.maxDiscountAmount : '',
                    totalLimit: coupon.totalLimit !== null && coupon.totalLimit !== undefined ? coupon.totalLimit : '',
                    userLimit: coupon.userLimit !== null && coupon.userLimit !== undefined ? coupon.userLimit : '',
                    startDate: coupon.startDate ? new Date(coupon.startDate) : new Date(),
                    endDate: coupon.endDate ? new Date(coupon.endDate) : new Date(),
                    isActive: coupon.isActive ?? true,
                });
            } catch (error) {
                console.error('Error fetching coupon:', error);
                toast.error('Lỗi khi tải thông tin coupon');
            } finally {
                setIsFetching(false);
            }
        };
        if (id) {
            fetchCoupon();
        }
    }, [id]);

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

            if (Number(formData.discountValue) <= 0) {
                toast.error('Giá trị giảm giá phải lớn hơn 0');
                return;
            }

            if (formData.type === 'PERCENTAGE' && Number(formData.discountValue) > 100) {
                toast.error('Phần trăm giảm giá không được vượt quá 100%');
                return;
            }

            // Convert arrays to JSON strings for API
            const submitData = {
                ...formData,
                discountValue: formData.discountValue !== '' ? Number(formData.discountValue) : undefined,
                minOrderAmount: formData.minOrderAmount !== '' ? Number(formData.minOrderAmount) : undefined,
                maxDiscountAmount: formData.maxDiscountAmount !== '' ? Number(formData.maxDiscountAmount) : undefined,
                totalLimit: formData.totalLimit !== '' ? Number(formData.totalLimit) : undefined,
                userLimit: formData.userLimit !== '' ? Number(formData.userLimit) : undefined,
            };

            await api.put(`/admin/coupons/${id}`, submitData);
            toast.success('Cập nhật coupon thành công');
            router.push('/admin/coupons');
        } catch (error) {
            console.error('Error updating coupon:', error);
            toast.error('Lỗi khi cập nhật coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof EditCouponForm, value: string | number | boolean | Date) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === '' ? '' : value
        }));
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

    if (isFetching) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Coupon</h1>
                    <p className="text-muted-foreground">
                        Cập nhật thông tin coupon
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
                                <Input
                                    id="code"
                                    value={formData.code || ''}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="Nhập mã coupon"
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên coupon *</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Nhập tên coupon"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về coupon"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Loại coupon *</Label>
                                    <Select
                                        value={formData.type || 'PERCENTAGE'}
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
                                        value={formData.scope || 'PLATFORM_WIDE'}
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
                                    onChange={(e) => handleInputChange('discountValue', e.target.value === '' ? '' : Number(e.target.value))}
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
                                    value={formData.minOrderAmount}
                                    onChange={(e) => handleInputChange('minOrderAmount', e.target.value === '' ? '' : Number(e.target.value))}
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
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value === '' ? '' : Number(e.target.value))}
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
                                    value={formData.totalLimit}
                                    onChange={(e) => handleInputChange('totalLimit', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Không giới hạn"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="userLimit">Giới hạn mỗi user</Label>
                                <Input
                                    id="userLimit"
                                    type="number"
                                    value={formData.userLimit}
                                    onChange={(e) => handleInputChange('userLimit', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Không giới hạn"
                                    min={1}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={!!formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                                <Label htmlFor="isActive">Kích hoạt</Label>
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
                                    value={formData.startDate instanceof Date ? formData.startDate.toISOString().slice(0, 16) : ''}
                                    onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Thời gian kết thúc *</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate instanceof Date ? formData.endDate.toISOString().slice(0, 16) : ''}
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
                                Thông tin coupon sau khi cập nhật
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Mã:</span>
                                        <span className="font-mono font-bold">{formData.code}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Tên:</span>
                                        <span className="font-medium">{formData.name}</span>
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
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Cập nhật coupon
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditCouponPage; 