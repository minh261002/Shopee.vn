"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/axios'
import { ArrowLeft, Save } from 'lucide-react'

interface Provider {
    id: string
    name: string
    code: string
}

interface RateFormData {
    name: string
    method: string
    basePrice: number
    perKgPrice: number
    estimatedDays: number
    isActive: boolean
    providerId: string
}

const NewRatePage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [providers, setProviders] = useState<Provider[]>([])
    const [formData, setFormData] = useState<RateFormData>({
        name: '',
        method: '',
        basePrice: 0,
        perKgPrice: 0,
        estimatedDays: 1,
        isActive: true,
        providerId: searchParams.get('providerId') || '',
    })

    // Fetch providers
    const fetchProviders = async () => {
        try {
            const response = await api.get('/admin/shipping/providers')
            setProviders(response.data)
        } catch (error) {
            console.error('Error fetching providers:', error)
            toast.error('Không thể tải danh sách nhà vận chuyển')
        }
    }

    useEffect(() => {
        fetchProviders()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validation
            if (!formData.name || !formData.method || !formData.providerId) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
                return
            }

            if (formData.basePrice < 0 || formData.perKgPrice < 0) {
                toast.error('Giá không được âm')
                return
            }

            if (formData.estimatedDays < 1) {
                toast.error('Thời gian ước tính phải lớn hơn 0')
                return
            }

            const response = await api.post('/admin/shipping/rates', formData)
            toast.success('Tạo biểu giá thành công')
            router.push(`/admin/shipping/rates/${response.data.id}`)
        } catch (error) {
            console.error('Error creating rate:', error)
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo biểu giá'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tạo biểu giá mới</CardTitle>
                    <CardDescription>
                        Thêm biểu giá vận chuyển mới cho nhà vận chuyển
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên biểu giá *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Giao hàng nhanh, Giao hàng tiết kiệm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="method">Phương thức *</Label>
                                    <Input
                                        id="method"
                                        value={formData.method}
                                        onChange={(e) => handleInputChange('method', e.target.value)}
                                        placeholder="Giao hàng nhanh, Giao hàng tiết kiệm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="providerId">Nhà vận chuyển *</Label>
                                <Select
                                    value={formData.providerId}
                                    onValueChange={(value) => handleInputChange('providerId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhà vận chuyển" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map((provider) => (
                                            <SelectItem key={provider.id} value={provider.id}>
                                                {provider.name} ({provider.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Cấu hình giá</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                                    <Input
                                        id="basePrice"
                                        type="number"
                                        min="0"
                                        value={formData.basePrice}
                                        onChange={(e) => handleInputChange('basePrice', Number(e.target.value))}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="perKgPrice">Giá theo kg (VNĐ/kg) *</Label>
                                    <Input
                                        id="perKgPrice"
                                        type="number"
                                        min="0"
                                        value={formData.perKgPrice}
                                        onChange={(e) => handleInputChange('perKgPrice', Number(e.target.value))}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimatedDays">Thời gian ước tính (ngày) *</Label>
                                <Input
                                    id="estimatedDays"
                                    type="number"
                                    min="1"
                                    value={formData.estimatedDays}
                                    onChange={(e) => handleInputChange('estimatedDays', Number(e.target.value))}
                                    placeholder="1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Cài đặt</h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                                <Label htmlFor="isActive">Kích hoạt biểu giá</Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? 'Đang tạo...' : 'Tạo biểu giá'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default NewRatePage 