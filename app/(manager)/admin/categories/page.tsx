"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
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
import type { Category, CategoriesResponse } from '@/types/category';

const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const router = useRouter();

    // Fetch categories
    const fetchCategories = async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            };

            const response = await api.get('/admin/categories', { params });
            const data: CategoriesResponse = response.data;
            setCategories(data.categories);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(1, searchTerm);
    }, [searchTerm]);

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    // Handle export
    const handleExport = () => {
        toast.info('Tính năng xuất dữ liệu đang được phát triển');
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchCategories(1, searchTerm);
    };

    // Handle delete
    const handleDelete = async (category: Category) => {
        try {
            await api.delete(`/admin/categories/${category.id}`);
            toast.success('Xóa danh mục thành công');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            // Error handling đã được xử lý trong axios interceptor
        }
    };

    // Handle edit
    const handleEdit = (category: Category) => {
        router.push(`/admin/categories/${category.id}/edit`);
    };

    // Handle view
    const handleView = (category: Category) => {
        router.push(`/admin/categories/${category.id}`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/categories/new');
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'image',
            header: 'Ảnh',
            cell: ({ row }) => (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                        src={row.original.image}
                        alt={row.original.name}
                        fill
                        className="object-cover"
                    />
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Tên danh mục',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ row }) => (
                <code className="text-xs bg-muted px-2 py-1 rounded">
                    {row.original.slug}
                </code>
            ),
        },
        {
            accessorKey: 'parent',
            header: 'Danh mục cha',
            cell: ({ row }) => (
                <div>
                    {row.original.parent ? (
                        <Badge variant="secondary">{row.original.parent.name}</Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">Không có</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'children',
            header: 'Danh mục con',
            cell: ({ row }) => (
                <div>
                    {row.original._count?.children ? (
                        <Badge variant="outline">{row.original._count.children}</Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'featured',
            header: 'Nổi bật',
            cell: ({ row }) => (
                <div>
                    {row.original.featured ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    ) : (
                        <span className="text-muted-foreground text-sm">Không</span>
                    )}
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
                            confirmTitle: 'Xác nhận xóa danh mục',
                            confirmMessage: `Bạn có chắc chắn muốn xóa danh mục "${row.original.name}"? Hành động này không thể hoàn tác.`,
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
                        <CardTitle>Danh sách danh mục</CardTitle>
                        <CardDescription>
                            Tổng cộng {pagination.total} danh mục
                        </CardDescription>
                    </div>
                    <div className="flex items-center justify-end">
                        <Button onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm danh mục
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={categories}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm danh mục..."
                        isLoading={isLoading}
                        emptyMessage="Không có danh mục nào."
                        onSearchChange={handleSearchChange}
                        onExport={handleExport}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoryPage;