"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Minus, Package } from 'lucide-react'
import Link from 'next/link'
import { ProductStatus, ProductCondition } from '@prisma/client'
import { api } from '@/lib/axios'
import { useParams, useRouter } from 'next/navigation'
import { CloudinaryMultipleUpload } from '@/components/layouts/cloudinary-upload'
import slugify from 'react-slugify'
import { useToast } from '@/hooks/use-toast'

interface ProductVariant {
    id: string
    name: string
    value: string
    price?: number
    stock: number
    sku: string
}

interface Category {
    id: string
    name: string
}

interface Brand {
    id: string
    name: string
}

interface Product {
    id: string
    name: string
    slug: string
    description: string
    shortDescription: string
    originalPrice: number
    salePrice?: number
    sku: string
    weight?: number
    length?: number
    width?: number
    height?: number
    categoryId: string
    brandId?: string
    status: ProductStatus
    condition: ProductCondition
    tags: string[]
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
    features?: string
    specifications?: string
    stock: number
    lowStockThreshold: number
    isDigital: boolean
    isFeatured: boolean
    requiresShipping: boolean
    images: string[]
    variants: ProductVariant[]
}

const EditProduct = () => {
    const params = useParams()
    const router = useRouter()
    const { success, error: showError } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        originalPrice: '',
        salePrice: '',
        sku: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        categoryId: '',
        brandId: '',
        status: 'DRAFT' as ProductStatus,
        condition: 'NEW' as ProductCondition,
        tags: [] as string[],
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        features: '',
        specifications: '',
        stock: '',
        lowStockThreshold: '5',
        isDigital: false,
        isFeatured: false,
        requiresShipping: true,
    })

    const [images, setImages] = useState<string[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [newTag, setNewTag] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes, brandsRes] = await Promise.all([
                    api.get(`/seller/products/${params.id}`),
                    api.get('/categories'),
                    api.get('/brands'),
                ])

                const product: Product = productRes.data

                // Populate form data
                setFormData({
                    name: product.name,
                    slug: product.slug,
                    description: product.description || '',
                    shortDescription: product.shortDescription || '',
                    originalPrice: product.originalPrice.toString(),
                    salePrice: product.salePrice?.toString() || '',
                    sku: product.sku,
                    weight: product.weight?.toString() || '',
                    length: product.length?.toString() || '',
                    width: product.width?.toString() || '',
                    height: product.height?.toString() || '',
                    categoryId: product.categoryId,
                    brandId: product.brandId || '',
                    status: product.status,
                    condition: product.condition,
                    tags: Array.isArray(product.tags) ? product.tags : [],
                    metaTitle: product.metaTitle || '',
                    metaDescription: product.metaDescription || '',
                    metaKeywords: product.metaKeywords || '',
                    features: product.features && typeof product.features === 'object'
                        ? JSON.stringify(product.features) : '',
                    specifications: product.specifications && typeof product.specifications === 'object'
                        ? JSON.stringify(product.specifications) : '',
                    stock: product.stock.toString(),
                    lowStockThreshold: product.lowStockThreshold.toString(),
                    isDigital: product.isDigital,
                    isFeatured: product.isFeatured,
                    requiresShipping: product.requiresShipping,
                })

                setImages(Array.isArray(product.images) ? product.images : [])
                setVariants(product.variants)
                setCategories(categoriesRes.data || [])
                setBrands(brandsRes.data || [])
            } catch (error) {
                console.error('Error fetching data:', error)
                showError('Không thể tải dữ liệu sản phẩm')
                router.push('/seller/products')
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchData()
        }
    }, [params.id])


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

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }))
            setNewTag('')
        }
    }

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }))
    }

    const addVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            name: '',
            value: '',
            stock: 0,
            sku: '',
        }
        setVariants(prev => [...prev, newVariant])
    }

    const updateVariant = (id: string, field: string, value: string | number) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ))
    }

    const removeVariant = (id: string) => {
        setVariants(prev => prev.filter(variant => variant.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validate required fields
            if (!formData.name || !formData.originalPrice || !formData.stock || !formData.categoryId) {
                showError('Vui lòng điền đầy đủ các trường bắt buộc')
                return
            }

            const productData = {
                ...formData,
                images: images.map(url => ({ url, alt: formData.name })),
                variants: variants.length > 0 ? variants : undefined,
                originalPrice: parseFloat(formData.originalPrice),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                length: formData.length ? parseFloat(formData.length) : undefined,
                width: formData.width ? parseFloat(formData.width) : undefined,
                height: formData.height ? parseFloat(formData.height) : undefined,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                // Handle JSON fields safely
                features: formData.features ? { description: formData.features } : undefined,
                specifications: formData.specifications ? { description: formData.specifications } : undefined,
            }

            await api.put(`/seller/products/${params.id}`, productData)

            success('Sản phẩm đã được cập nhật thành công!')
            router.push(`/seller/products/${params.id}`)
        } catch (error) {
            console.error('Error updating product:', error)

            if (error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' &&
                'data' in error.response && error.response.data &&
                typeof error.response.data === 'object' && 'error' in error.response.data) {
                showError(String(error.response.data.error))
            } else {
                showError('Có lỗi xảy ra khi cập nhật sản phẩm')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
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
                                        <Label htmlFor="name">Tên sản phẩm *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Nhập tên sản phẩm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL slug</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                            placeholder="url-san-pham"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                                    <Textarea
                                        id="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                        placeholder="Mô tả ngắn gọn về sản phẩm"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả chi tiết</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Mô tả chi tiết về sản phẩm"
                                        rows={6}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Giá cả</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="originalPrice">Giá gốc *</Label>
                                        <Input
                                            id="originalPrice"
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salePrice">Giá khuyến mãi</Label>
                                        <Input
                                            id="salePrice"
                                            type="number"
                                            value={formData.salePrice}
                                            onChange={(e) => handleInputChange('salePrice', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU *</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={(e) => handleInputChange('sku', e.target.value)}
                                            placeholder="SKU-001"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Kho hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Số lượng tồn kho *</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => handleInputChange('stock', e.target.value)}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lowStockThreshold">Cảnh báo hết hàng</Label>
                                        <Input
                                            id="lowStockThreshold"
                                            type="number"
                                            value={formData.lowStockThreshold}
                                            onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Physical Properties */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông số vật lý</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Cân nặng (kg)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            value={formData.weight}
                                            onChange={(e) => handleInputChange('weight', e.target.value)}
                                            placeholder="0.5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="length">Chiều dài (cm)</Label>
                                        <Input
                                            id="length"
                                            type="number"
                                            step="0.1"
                                            value={formData.length}
                                            onChange={(e) => handleInputChange('length', e.target.value)}
                                            placeholder="10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="width">Chiều rộng (cm)</Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            step="0.1"
                                            value={formData.width}
                                            onChange={(e) => handleInputChange('width', e.target.value)}
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Chiều cao (cm)</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            step="0.1"
                                            value={formData.height}
                                            onChange={(e) => handleInputChange('height', e.target.value)}
                                            placeholder="2"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hình ảnh sản phẩm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CloudinaryMultipleUpload
                                    values={images}
                                    onChange={setImages}
                                    folder="products"
                                    maxFiles={10}
                                    placeholder="Upload ảnh sản phẩm"
                                />
                            </CardContent>
                        </Card>

                        {/* Product Variants */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Biến thể sản phẩm</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm biến thể
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {variants.map((variant) => (
                                    <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Biến thể #{variant.id}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeVariant(variant.id)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tên thuộc tính</Label>
                                                <Input
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                    placeholder="Màu sắc, Kích thước..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giá trị</Label>
                                                <Input
                                                    value={variant.value}
                                                    onChange={(e) => updateVariant(variant.id, 'value', e.target.value)}
                                                    placeholder="Đỏ, XL..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số lượng</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SKU</Label>
                                                <Input
                                                    value={variant.sku}
                                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                    placeholder="SKU-VAR-001"
                                                />
                                            </div>
                                        </div>
                                        {variant.price !== undefined && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Giá riêng</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.price || ''}
                                                        onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                                        placeholder="Để trống nếu dùng giá chung"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {variants.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có biến thể nào. Nhấn &quot;Thêm biến thể&quot; để tạo các phiên bản khác nhau của sản phẩm.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Visibility */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Xuất bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as ProductStatus)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                            <SelectItem value="ACTIVE">Đang bán</SelectItem>
                                            <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                                            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="condition">Tình trạng</Label>
                                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value as ProductCondition)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW">Mới</SelectItem>
                                            <SelectItem value="LIKE_NEW">Như mới</SelectItem>
                                            <SelectItem value="GOOD">Tốt</SelectItem>
                                            <SelectItem value="FAIR">Khá</SelectItem>
                                            <SelectItem value="REFURBISHED">Tân trang</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isFeatured"
                                            checked={formData.isFeatured}
                                            onCheckedChange={(checked) => handleInputChange('isFeatured', checked.toString())}
                                        />
                                        <Label htmlFor="isFeatured">Sản phẩm nổi bật</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isDigital"
                                            checked={formData.isDigital}
                                            onCheckedChange={(checked) => handleInputChange('isDigital', checked.toString())}
                                        />
                                        <Label htmlFor="isDigital">Sản phẩm số</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="requiresShipping"
                                            checked={formData.requiresShipping}
                                            onCheckedChange={(checked) => handleInputChange('requiresShipping', checked.toString())}
                                        />
                                        <Label htmlFor="requiresShipping">Cần vận chuyển</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Phân loại</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Danh mục</Label>
                                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brandId">Thương hiệu</Label>
                                    <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thương hiệu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Thêm tag"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                            Thêm
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                                {tag}
                                                <X className="w-3 h-3 ml-1" />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SEO */}
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="metaTitle">Meta Title</Label>
                                    <Input
                                        id="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                                        placeholder="Tiêu đề SEO"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaDescription">Meta Description</Label>
                                    <Textarea
                                        id="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                                        placeholder="Mô tả SEO"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                    <Input
                                        id="metaKeywords"
                                        value={formData.metaKeywords}
                                        onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
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
                                    <Package className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" asChild>
                                    <Link href={`/seller/products/${params.id}`}>Hủy</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditProduct 