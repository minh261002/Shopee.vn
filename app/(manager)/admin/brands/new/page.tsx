"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tag } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload'
import slugify from 'react-slugify'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

const NewBrand = () => {
    const router = useRouter()
    const { success, error: showError } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        logo: '',
        website: '',
        isActive: true,
        isFeatured: false,
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        if (field === 'name' && typeof value === 'string') {
            setFormData(prev => ({
                ...prev,
                slug: slugify(value)
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Basic validation
            if (!formData.name || !formData.slug) {
                showError('Tên thương hiệu và slug là bắt buộc')
                return
            }

            // Validate website URL if provided
            let websiteUrl = formData.website
            if (websiteUrl && !websiteUrl.startsWith('http')) {
                websiteUrl = `https://${websiteUrl}`
            }

            const submitData = {
                ...formData,
                website: websiteUrl || null,
            }

            await api.post('/admin/brands', submitData)

            success('Thương hiệu đã được tạo thành công!')
            router.push('/admin/brands')
        } catch (error) {
            console.error('Error creating brand:', error)

            if (error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' &&
                'data' in error.response && error.response.data &&
                typeof error.response.data === 'object' && 'error' in error.response.data) {
                showError(String(error.response.data.error))
            } else {
                showError('Có lỗi xảy ra khi tạo thương hiệu')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Tên thương hiệu *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Nhập tên thương hiệu"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL slug *</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                            placeholder="url-thuong-hieu"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Mô tả về thương hiệu"
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Logo thương hiệu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CloudinaryUpload
                                    value={formData.logo}
                                    onChange={(url) => handleInputChange('logo', url)}
                                    folder="brands"
                                    placeholder="Upload logo thương hiệu"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Tỷ lệ khuyến nghị: 1:1 (vuông), kích thước tối thiểu 200x200px
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', !!checked)}
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Thương hiệu hoạt động
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Thương hiệu hoạt động sẽ hiển thị trong danh sách lựa chọn khi tạo sản phẩm
                                </p>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => handleInputChange('isFeatured', !!checked)}
                                    />
                                    <Label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Thương hiệu nổi bật
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Thương hiệu nổi bật sẽ được ưu tiên hiển thị trên trang chủ
                                </p>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        {(formData.name || formData.logo) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Xem trước</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {formData.logo ? (
                                                <Image
                                                    src={formData.logo}
                                                    alt={formData.name}
                                                    className="w-full h-full object-cover"
                                                    width={100}
                                                    height={100}
                                                />
                                            ) : (
                                                <Tag className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">
                                                {formData.name || 'Tên thương hiệu'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {formData.description || 'Mô tả thương hiệu'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    <Tag className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Đang tạo...' : 'Tạo thương hiệu'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" asChild>
                                    <Link href="/admin/brands">Hủy</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default NewBrand 