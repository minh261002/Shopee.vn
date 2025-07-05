"use client";

import React, { useState, useEffect, use } from 'react';
import { ArrowLeft, Edit, Trash2, Star, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/axios';
import type { Category } from '@/types/category';


const CategoryDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch category data
    const fetchCategory = async () => {
        try {
            const response = await api.get(`/admin/categories/${id}`);
            const data = response.data;
            setCategory(data);
        } catch (error) {
            console.error('Error fetching category:', error);
            // Error handling đã được xử lý trong axios interceptor
            router.push('/admin/categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, [id]);

    // Handle delete
    const handleDelete = async () => {
        if (!category) return;

        try {
            await api.delete(`/admin/categories/${category.id}`);
            toast.success('Xóa danh mục thành công');
            router.push('/admin/categories');
        } catch (error) {
            console.error('Error deleting category:', error);
            // Error handling đã được xử lý trong axios interceptor
        }
    };

    // Handle edit
    const handleEdit = () => {
        router.push(`/admin/categories/${id}/edit`);
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

    if (!category) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-muted-foreground">Không tìm thấy danh mục</h2>
                    <p className="text-muted-foreground mt-2">
                        Danh mục bạn đang tìm kiếm không tồn tại
                    </p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                        <CardDescription>
                            Thông tin chính của danh mục
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{category.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                        {category.slug}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Trạng thái nổi bật:</span>
                                <div className="flex items-center gap-2">
                                    {category.featured ? (
                                        <>
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                            <Badge variant="default">Nổi bật</Badge>
                                        </>
                                    ) : (
                                        <Badge variant="secondary">Bình thường</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Danh mục cha:</span>
                                <div>
                                    {category.parent ? (
                                        <Badge variant="outline">{category.parent.name}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Không có</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Số danh mục con:</span>
                                <div>
                                    {category._count?.children ? (
                                        <Badge variant="outline">{category._count.children}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">0</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin thời gian</CardTitle>
                        <CardDescription>
                            Thời gian tạo và cập nhật danh mục
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ngày tạo:</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(category.createdAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(category.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Children Categories */}
            {category.children && category.children.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Danh mục con</CardTitle>
                        <CardDescription>
                            Các danh mục con của danh mục này
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.children.map((child) => (
                                <div
                                    key={child.id}
                                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/admin/categories/${child.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{child.name}</h4>
                                            <p className="text-sm text-muted-foreground">{child.slug}</p>
                                        </div>
                                        <Badge variant="outline">Con</Badge>
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

export default CategoryDetailPage; 