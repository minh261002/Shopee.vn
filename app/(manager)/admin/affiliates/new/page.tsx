"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
}

const NewAffiliatePage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        userId: '',
        defaultCommissionRate: '',
        bankAccount: '',
        taxCode: '',
        paymentEmail: '',
        applicationNote: '',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users?limit=100');
                setUsers(response.data.users || []);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Lỗi khi tải danh sách người dùng');
            }
        };

        fetchUsers();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        if (!formData.userId || !formData.defaultCommissionRate) {
            toast.error('Vui lòng chọn người dùng và nhập tỷ lệ hoa hồng');
            return;
        }

        // Validate commission rate
        const commissionRate = parseFloat(formData.defaultCommissionRate);
        if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
            toast.error('Tỷ lệ hoa hồng phải từ 0 đến 100%');
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/admin/affiliates', formData);
            toast.success('Tạo affiliate thành công');
            router.push('/admin/affiliates');
        } catch (error) {
            console.error('Error creating affiliate:', error);
            toast.error('Lỗi khi tạo affiliate');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

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
                        <h1 className="text-2xl font-bold">Thêm Affiliate mới</h1>
                        <p className="text-muted-foreground">
                            Tạo affiliate mới cho hệ thống
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Đang tạo...' : 'Tạo affiliate'}
                </Button>
            </div>

            {/* Form */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* User Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Chọn người dùng</span>
                        </CardTitle>
                        <CardDescription>
                            Chọn người dùng để tạo affiliate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userId">Người dùng</Label>
                            <Select
                                value={formData.userId}
                                onValueChange={(value) => handleInputChange('userId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn người dùng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

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
            </div>

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin thanh toán</CardTitle>
                    <CardDescription>
                        Thông tin thanh toán cho affiliate (tùy chọn)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
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

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
};

export default NewAffiliatePage; 