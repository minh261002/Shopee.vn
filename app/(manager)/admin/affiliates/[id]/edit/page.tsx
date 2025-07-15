"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, UserCheck, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Affiliate } from '@/types/affiliate';

const EditAffiliatePage = () => {
    const router = useRouter();
    const params = useParams();
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        defaultCommissionRate: '',
        bankAccount: '',
        taxCode: '',
        paymentEmail: '',
        applicationNote: '',
        rejectionReason: '',
    });

    useEffect(() => {
        const fetchAffiliate = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/admin/affiliates/${params.id}`);
                const affiliateData = response.data;
                setAffiliate(affiliateData);
                setFormData({
                    defaultCommissionRate: affiliateData.defaultCommissionRate?.toString() || '',
                    bankAccount: affiliateData.bankAccount || '',
                    taxCode: affiliateData.taxCode || '',
                    paymentEmail: affiliateData.paymentEmail || '',
                    applicationNote: affiliateData.applicationNote || '',
                    rejectionReason: affiliateData.rejectionReason || '',
                });
            } catch (error) {
                console.error('Error fetching affiliate:', error);
                toast.error('Lỗi khi tải thông tin affiliate');
                router.push('/admin/affiliates');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchAffiliate();
        }
    }, [params.id, router]);

    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        // Validate commission rate
        const commissionRate = parseFloat(formData.defaultCommissionRate);
        if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
            toast.error('Tỷ lệ hoa hồng phải từ 0 đến 100%');
            return;
        }

        try {
            setIsSaving(true);
            await api.put(`/admin/affiliates/${params.id}`, formData);
            toast.success('Cập nhật affiliate thành công');
            router.push(`/admin/affiliates/${params.id}`);
        } catch (error) {
            console.error('Error updating affiliate:', error);
            toast.error('Lỗi khi cập nhật affiliate');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!affiliate) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Không tìm thấy affiliate</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa Affiliate</h1>
                        <p className="text-muted-foreground">
                            Cập nhật thông tin affiliate
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>

            {/* Affiliate Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>Thông tin Affiliate</span>
                    </CardTitle>
                    <CardDescription>
                        Thông tin cơ bản của affiliate
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{affiliate.user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{affiliate.user?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Form */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Commission Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>Cài đặt hoa hồng</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="commissionRate">Tỷ lệ hoa hồng (%)</Label>
                            <Input
                                id="commissionRate"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.defaultCommissionRate}
                                onChange={(e) => handleInputChange('defaultCommissionRate', e.target.value)}
                                placeholder="5.0"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bankAccount">Tài khoản ngân hàng</Label>
                            <Input
                                id="bankAccount"
                                value={formData.bankAccount}
                                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                                placeholder="Số tài khoản ngân hàng"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentEmail">Email thanh toán</Label>
                            <Input
                                id="paymentEmail"
                                type="email"
                                value={formData.paymentEmail}
                                onChange={(e) => handleInputChange('paymentEmail', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxCode">Mã số thuế</Label>
                            <Input
                                id="taxCode"
                                value={formData.taxCode}
                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                placeholder="Mã số thuế"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="applicationNote">Ghi chú đăng ký</Label>
                        <Textarea
                            id="applicationNote"
                            value={formData.applicationNote}
                            onChange={(e) => handleInputChange('applicationNote', e.target.value)}
                            placeholder="Ghi chú về affiliate..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rejectionReason">Lý do từ chối</Label>
                        <Textarea
                            id="rejectionReason"
                            value={formData.rejectionReason}
                            onChange={(e) => handleInputChange('rejectionReason', e.target.value)}
                            placeholder="Lý do từ chối (nếu có)..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditAffiliatePage; 