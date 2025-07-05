"use client";

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import slugify from "react-slugify";
import { api } from '@/lib/axios';
import type { Category, CategoriesResponse } from '@/types/category';
import { categorySchema, CategoryFormData } from '@/validations/category';


const NewCategoryPage = () => {
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            slug: '',
            image: '',
            featured: false,
            parentId: 'none',
        },
    });

    // Fetch parent categories for select
    const fetchParentCategories = async () => {
        try {
            const response = await api.get('/admin/categories', { params: { limit: 100 } });
            const data: CategoriesResponse = response.data;
            setParentCategories(data.categories);
        } catch (error) {
            console.error('Error fetching parent categories:', error);
            // Error handling đã được xử lý trong axios interceptor
        }
    };

    useEffect(() => {
        fetchParentCategories();
    }, []);

    // Handle form submission
    const onSubmit = async (data: CategoryFormData) => {
        try {
            setIsLoading(true);
            // Convert "none" to undefined for parentId
            const formData = {
                ...data,
                parentId: data.parentId === 'none' ? undefined : data.parentId,
            };

            await api.post('/admin/categories', formData);
            toast.success('Tạo danh mục thành công');
            router.push('/admin/categories');
        } catch (error) {
            console.error('Error submitting form:', error);
            // Error handling đã được xử lý trong axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        const slug = slugify(name);
        form.setValue('slug', slug);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột chính - Thông tin danh mục */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin danh mục</CardTitle>
                            <CardDescription>
                                Điền thông tin để tạo danh mục mới
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên danh mục</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nhập tên danh mục"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            handleNameChange(e.target.value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="ten-danh-muc"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    URL-friendly version của tên danh mục
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="parentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Danh mục cha</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Danh mục gốc</SelectItem>
                                                        {parentCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Chọn danh mục cha nếu đây là danh mục con
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="featured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Nổi bật</FormLabel>
                                                    <FormDescription>
                                                        Hiển thị danh mục này ở vị trí nổi bật
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Cột phụ - Ảnh và Submit */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ảnh danh mục</CardTitle>
                            <CardDescription>
                                Upload ảnh đại diện cho danh mục
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <CloudinaryUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    folder="categories"
                                                    placeholder="Upload ảnh danh mục"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thao tác</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            <Button
                                type="submit"
                                className="w-1/2"
                                disabled={isLoading}
                                onClick={form.handleSubmit(onSubmit)}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-1/2"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NewCategoryPage; 