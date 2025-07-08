"use client"

import React, { useEffect, useState } from 'react'
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

interface Brand {
    id: string
    name: string
    slug: string
    description?: string
    logo?: string
    website?: string
    isActive: boolean
    isFeatured: boolean
    createdAt: string
    updatedAt: string
}

interface EditBrandProps {
    params: {
        id: string
    }
}

const EditBrand: React.FC<EditBrandProps> = ({ params }) => {
    const router = useRouter()
    const { success, error: showError } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [originalBrand, setOriginalBrand] = useState<Brand | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        logo: '',
        website: '',
        isActive: true,
        isFeatured: false,
    })

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await api.get(`/admin/brands/${params.id}`)
                const brand = response.data

                setOriginalBrand(brand)
                setFormData({
                    name: brand.name || '',
                    slug: brand.slug || '',
                    description: brand.description || '',
                    logo: brand.logo || '',
                    website: brand.website || '',
                    isActive: brand.isActive ?? true,
                    isFeatured: brand.isFeatured ?? false,
                })
            } catch (error) {
                console.error('Error fetching brand:', error)
                showError('Không thể tải thông tin thương hiệu')
                router.push('/admin/brands')
            } finally {
                setIsLoading(false)
            }
        }

        fetchBrand()
    }, [params.id, router, showError])

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Auto-generate slug only if it hasn't been manually changed
        if (field === 'name' && typeof value === 'string') {
            const newSlug = slugify(value)
            // Only update slug if it matches the original auto-generated pattern
            if (originalBrand && formData.slug === slugify(originalBrand.name)) {
                setFormData(prev => ({
                    ...prev,
                    slug: newSlug
                }))
            }
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

            const updateData = {
                ...formData,
                // Only send logo if it's not empty, otherwise send null to clear it
                logo: formData.logo || null,
                // Only send website if it's not empty, otherwise send null to clear it
                website: websiteUrl || null,
            }

            await api.put(`/admin/brands/${params.id}`, updateData)

            success('Cập nhật thương hiệu thành công!')
            router.push(`/admin/brands/${params.id}`)
        } catch (error) {
            console.error('Error updating brand:', error)

            if (error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' &&
                'data' in error.response && error.response.data &&
                typeof error.response.data === 'object' && 'error' in error.response.data) {
                showError(String(error.response.data.error))
            } else {
                showError('Có lỗi xảy ra khi cập nhật thương hiệu')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!originalBrand) {
        return <div>Không tìm thấy thương hiệu</div>
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

                        {/* Original Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin gốc</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div>
                                    <p className="font-medium text-muted-foreground">ID</p>
                                    <p className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{originalBrand.id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Tạo lúc</p>
                                    <p>{new Date(originalBrand.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Cập nhật lúc</p>
                                    <p>{new Date(originalBrand.updatedAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    <Tag className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thương hiệu'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" asChild>
                                    <Link href={`/admin/brands/${params.id}`}>Hủy</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditBrand 