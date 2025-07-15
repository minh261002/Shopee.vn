"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/axios'
import { useStore } from '@/providers/store-context'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import AddressPicker from '@/components/ui/address-picker'

interface LocationFormData {
    name: string
    code: string
    address: string
    lat?: number
    lng?: number
    isActive: boolean
}

const NewLocationPage = () => {
    const { success, error: showError } = useToast()
    const router = useRouter()
    const { currentStore } = useStore()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<LocationFormData>({
        name: '',
        code: '',
        address: '',
        lat: undefined,
        lng: undefined,
        isActive: true
    })

    const handleInputChange = (field: keyof LocationFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const generateCode = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substring(2, 5).toUpperCase()
        return `WH${timestamp}${random}`
    }

    const handleGenerateCode = () => {
        handleInputChange('code', generateCode())
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentStore) {
            showError('Không tìm thấy thông tin cửa hàng')
            return
        }

        if (!formData.name || !formData.code || !formData.address) {
            showError('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        setIsLoading(true)
        try {
            await api.post(`/seller/inventory/locations?storeId=${currentStore.id}`, formData)
            success('Tạo kho mới thành công')
            router.push('/seller/inventory/locations')
        } catch (error: unknown) {
            console.error('Error creating location:', error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo kho'
            showError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/seller/inventory/locations">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Thêm kho mới</h1>
                        <p className="text-muted-foreground">
                            Tạo vị trí kho hàng mới cho cửa hàng của bạn
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin kho</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Tên kho */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên kho *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Ví dụ: Kho Hà Nội, Kho HCM"
                                    required
                                />
                            </div>

                            {/* Mã kho */}
                            <div className="space-y-2">
                                <Label htmlFor="code">Mã kho *</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => handleInputChange('code', e.target.value)}
                                        placeholder="Ví dụ: WH001"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGenerateCode}
                                    >
                                        Tạo mã
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <AddressPicker
                            value={{
                                address: formData.address,
                                lat: formData.lat,
                                lng: formData.lng
                            }}
                            onChange={(addressData) => {
                                setFormData(prev => ({
                                    ...prev,
                                    address: addressData.address,
                                    lat: addressData.lat,
                                    lng: addressData.lng
                                }))
                            }}
                            placeholder="Chọn địa chỉ kho"
                            isStore={true}
                        />

                        {/* Cài đặt */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Trạng thái hoạt động</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Kho này có thể được sử dụng để quản lý tồn kho
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                            </div>


                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/seller/inventory/locations">
                                    Hủy
                                </Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Tạo kho
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default NewLocationPage 