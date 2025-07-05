"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { api } from '@/lib/axios';
import type { UserData, UsersResponse } from '@/types/user';

const UsersPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const router = useRouter();

    // Fetch users
    const fetchUsers = async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            };

            const response = await api.get('/admin/users', { params });
            const data: UsersResponse = response.data;
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle delete
    const handleDelete = async (user: UserData) => {
        try {
            await api.delete(`/admin/users/${user.id}`);
            toast.success('Xóa tài khoản thành công');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            // Error handling đã được xử lý trong axios interceptor
        }
    };

    // Handle edit
    const handleEdit = (user: UserData) => {
        router.push(`/admin/users/${user.id}/edit`);
    };

    // Handle view
    const handleView = (user: UserData) => {
        router.push(`/admin/users/${user.id}`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/users/new');
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge variant="default">Quản trị viên</Badge>;
            case 'SELLER':
                return <Badge variant="secondary">Chủ cửa hàng</Badge>;
            case 'USER':
                return <Badge variant="outline">Khách hàng</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const columns: ColumnDef<UserData>[] = [
        {
            accessorKey: 'image',
            header: 'Ảnh',
            cell: ({ row }) => (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {row.original.image ? (
                        <Image
                            src={row.original.image}
                            alt={row.original.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">
                                {row.original.name.charAt(0).toUpperCase() || row.original.email.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Tên',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.email}</div>
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Vai trò',
            cell: ({ row }) => getRoleBadge(row.original.role),
        },
        {
            accessorKey: 'emailVerified',
            header: 'Xác thực',
            cell: ({ row }) => (
                <div>
                    {row.original.emailVerified ? (
                        <Badge variant="default" className="bg-green-500">
                            <Mail className="h-3 w-3 mr-1" />
                            Đã xác thực
                        </Badge>
                    ) : (
                        <Badge variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Chưa xác thực
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'sessions',
            header: 'Phiên',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {row.original._count?.sessions || 0}
                </div>
            ),
        },
        {
            accessorKey: 'addresses',
            header: 'Địa chỉ',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {row.original._count?.addresses || 0}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày tạo',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actions={[
                        {
                            label: 'Xem',
                            onClick: handleView,
                            icon: Eye,
                        },
                        {
                            label: 'Chỉnh sửa',
                            onClick: handleEdit,
                            icon: Edit,
                        },
                        {
                            label: 'Xóa',
                            onClick: handleDelete,
                            icon: Trash2,
                            variant: 'destructive',
                            separator: true,
                            confirmTitle: 'Xác nhận xóa tài khoản',
                            confirmMessage: `Bạn có chắc chắn muốn xóa tài khoản "${row.original.name}"? Hành động này không thể hoàn tác.`,
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">

            <Card>
                <CardHeader className='flex items-center justify-between'>
                    <div>
                        <CardTitle>Danh sách tài khoản</CardTitle>
                        <CardDescription>
                            Tổng cộng {pagination.total} tài khoản
                        </CardDescription>
                    </div>

                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm tài khoản
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={users}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm tài khoản..."
                        isLoading={isLoading}
                        emptyMessage="Không có tài khoản nào."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersPage; 