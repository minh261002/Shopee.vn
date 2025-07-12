"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { ArrowLeft, Save } from 'lucide-react'

const NewShippingProviderPage = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        logo: '',
        website: '',
        apiKey: '',
        apiSecret: '',
        apiUrl: '',
        isActive: true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validation
            if (!formData.name || !formData.code) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
                return
            }

            await api.post('/admin/shipping/providers', formData)
            toast.success('Thêm nhà vận chuyển thành công')
            router.push('/admin/shipping/providers')
        } catch (error: unknown) {
            console.error('Error creating provider:', error)
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo nhà vận chuyển'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleLogoUpload = (url: string) => {
        handleInputChange('logo', url)
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
                    <CardTitle>Thêm nhà vận chuyển mới</CardTitle>
                    <CardDescription>
                        Thêm nhà vận chuyển mới vào hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên nhà vận chuyển *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Nhập tên nhà vận chuyển"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Mã nhà vận chuyển *</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                        placeholder="GHN, GHTK, VNPOST"
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
                                    placeholder="Mô tả về nhà vận chuyển"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Logo</h3>
                            <div className="space-y-2">
                                <Label>Logo nhà vận chuyển</Label>
                                <CloudinaryUpload
                                    onChange={handleLogoUpload}
                                    value={formData.logo}
                                    folder="shipping-providers"
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin liên hệ</h3>
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
                        </div>

                        {/* API Configuration */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Cấu hình API</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey">API Key</Label>
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        value={formData.apiKey}
                                        onChange={(e) => handleInputChange('apiKey', e.target.value)}
                                        placeholder="Nhập API Key"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiSecret">API Secret</Label>
                                    <Input
                                        id="apiSecret"
                                        type="password"
                                        value={formData.apiSecret}
                                        onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                                        placeholder="Nhập API Secret"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apiUrl">API URL</Label>
                                <Input
                                    id="apiUrl"
                                    type="url"
                                    value={formData.apiUrl}
                                    onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                                    placeholder="https://api.example.com"
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
                                <Label htmlFor="isActive">Kích hoạt nhà vận chuyển</Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? 'Đang tạo...' : 'Tạo nhà vận chuyển'}
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

export default NewShippingProviderPage 