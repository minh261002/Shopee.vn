"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, UserCheck, DollarSign, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Affiliate } from '@/types/affiliate';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';

const AffiliateDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAffiliate = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/admin/affiliates/${params.id}`);
                setAffiliate(response.data);
            } catch (error) {
                console.error('Error fetching affiliate:', error);
                toast.error('Lỗi khi tải thông tin affiliate');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchAffiliate();
        }
    }, [params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/admin/affiliates/${params.id}/edit`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge variant="default">Đã phê duyệt</Badge>;
            case 'PENDING':
                return <Badge variant="secondary">Chờ phê duyệt</Badge>;
            case 'SUSPENDED':
                return <Badge variant="destructive">Đã tạm ngưng</Badge>;
            case 'REJECTED':
                return <Badge variant="outline">Đã từ chối</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
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
                        <h1 className="text-2xl font-bold">Chi tiết Affiliate</h1>
                        <p className="text-muted-foreground">
                            Thông tin chi tiết về affiliate và hoạt động của họ
                        </p>
                    </div>
                </div>
                <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                </Button>
            </div>

            {/* Main Info */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Affiliate Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <UserCheck className="h-5 w-5" />
                            <span>Thông tin Affiliate</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                {affiliate.user?.image ? (
                                    <Image
                                        src={affiliate.user.image}
                                        alt={affiliate.user.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <UserCheck className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold">{affiliate.user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{affiliate.user?.email}</p>
                                {getStatusBadge(affiliate.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ hoa hồng</p>
                                <p className="text-lg font-semibold">{affiliate.defaultCommissionRate}%</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ngày đăng ký</p>
                                <p className="text-sm">
                                    {format(new Date(affiliate.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                </p>
                            </div>
                        </div>

                        {affiliate.applicationNote && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ghi chú đăng ký</p>
                                <p className="text-sm">{affiliate.applicationNote}</p>
                            </div>
                        )}

                        {affiliate.rejectionReason && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lý do từ chối</p>
                                <p className="text-sm text-destructive">{affiliate.rejectionReason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Thống kê</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-primary/5 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-2xl font-bold">{affiliate.totalReferrals}</p>
                                <p className="text-sm text-muted-foreground">Tổng giới thiệu</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(affiliate.totalCommission)}
                                </p>
                                <p className="text-sm text-muted-foreground">Tổng hoa hồng</p>
                            </div>
                        </div>

                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(affiliate.unpaidCommission)}
                            </p>
                            <p className="text-sm text-muted-foreground">Hoa hồng chưa thanh toán</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Info */}
            {(affiliate.bankAccount || affiliate.paymentEmail || affiliate.taxCode) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>Thông tin thanh toán</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {affiliate.bankAccount && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tài khoản ngân hàng</p>
                                    <p className="text-sm">{affiliate.bankAccount}</p>
                                </div>
                            )}
                            {affiliate.paymentEmail && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email thanh toán</p>
                                    <p className="text-sm">{affiliate.paymentEmail}</p>
                                </div>
                            )}
                            {affiliate.taxCode && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Mã số thuế</p>
                                    <p className="text-sm">{affiliate.taxCode}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity */}
            {affiliate.commissions && affiliate.commissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hoa hồng gần đây</CardTitle>
                        <CardDescription>
                            Danh sách các hoa hồng đã nhận
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {affiliate.commissions.slice(0, 5).map((commission) => (
                                <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            Đơn hàng #{commission.order?.orderNumber}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(commission.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(commission.commissionAmount)}
                                        </p>
                                        <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                                            {commission.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AffiliateDetailPage; 