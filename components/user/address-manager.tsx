"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import AddressPicker from '@/components/ui/address-picker';

interface UserAddress {
    id: string;
    userId: string;
    address: string;
    type: 'HOME' | 'WORK' | 'OTHER';
    lat: number | null;
    lng: number | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CreateAddressRequest {
    address: string;
    type?: 'HOME' | 'WORK' | 'OTHER';
    lat?: number;
    lng?: number;
    isDefault?: boolean;
}

interface AddressManagerProps {
    userId: string;
}

const AddressManager = ({ userId }: AddressManagerProps) => {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
    const [formData, setFormData] = useState<CreateAddressRequest>({
        address: '',
        type: 'HOME',
        lat: undefined,
        lng: undefined,
        isDefault: false,
    });

    // Fetch addresses
    const fetchAddresses = async () => {
        try {
            setIsFetching(true);
            const response = await api.get(`/admin/users/${userId}/addresses`);
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Không thể tải danh sách địa chỉ');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.address.trim()) {
            toast.error('Vui lòng nhập địa chỉ');
            return;
        }

        try {
            setIsLoading(true);
            if (editingAddress) {
                await api.put(`/admin/users/${userId}/addresses/${editingAddress.id}`, formData);
                toast.success('Cập nhật địa chỉ thành công');
            } else {
                await api.post(`/admin/users/${userId}/addresses`, formData);
                toast.success('Thêm địa chỉ thành công');
            }

            setIsDialogOpen(false);
            setEditingAddress(null);
            setFormData({ address: '', lat: undefined, lng: undefined });
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (address: UserAddress) => {
        setEditingAddress(address);
        setFormData({
            address: address.address,
            type: address.type,
            lat: address.lat || undefined,
            lng: address.lng || undefined,
            isDefault: address.isDefault,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (address: UserAddress) => {
        try {
            await api.delete(`/admin/users/${userId}/addresses/${address.id}`);
            toast.success('Xóa địa chỉ thành công');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            // Error handling đã được xử lý trong axios interceptor
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setFormData({
            address: '',
            type: 'HOME',
            lat: undefined,
            lng: undefined,
            isDefault: false
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingAddress(null);
        setFormData({
            address: '',
            type: 'HOME',
            lat: undefined,
            lng: undefined,
            isDefault: false
        });
    };

    if (isFetching) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Địa chỉ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Địa chỉ ({addresses.length})
                            </CardTitle>
                            <CardDescription>
                                Quản lý địa chỉ của người dùng
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNew} size="sm" type='button'>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm địa chỉ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {addresses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có địa chỉ nào</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{address.address}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {address.type === 'HOME' ? 'Nhà riêng' :
                                                    address.type === 'WORK' ? 'Văn phòng' : 'Khác'}
                                            </Badge>
                                            {address.isDefault && (
                                                <Badge variant="default" className="text-xs bg-green-500">
                                                    Mặc định
                                                </Badge>
                                            )}
                                            {address.lat && address.lng && (
                                                <Badge variant="outline" className="text-xs">
                                                    {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(address.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type='button'
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(address)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button type='button' variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(address)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Xóa địa chỉ
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress ? 'Cập nhật thông tin địa chỉ' : 'Thêm địa chỉ mới cho người dùng'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <AddressPicker
                            value={{
                                address: formData.address,
                                lat: formData.lat,
                                lng: formData.lng,
                                type: formData.type,
                                isDefault: formData.isDefault,
                            }}
                            onChange={(value) => setFormData({
                                address: value.address,
                                lat: value.lat,
                                lng: value.lng,
                                type: value.type,
                                isDefault: value.isDefault,
                            })}
                            placeholder="Chọn địa chỉ"
                        />
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={handleDialogClose}>
                                Hủy
                            </Button>
                            <Button type="button" disabled={isLoading} onClick={handleSubmit}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddressManager; 