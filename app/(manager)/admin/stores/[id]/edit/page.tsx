"use client"

import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/axios'
import type { StoreData } from '@/types/store'
import { StoreStatus, StoreType, VerificationStatus } from '@prisma/client'

const initialFormData: Partial<StoreData> = {
    name: '',
    description: '',
    status: 'PENDING_APPROVAL',
    type: 'INDIVIDUAL',
    verificationStatus: 'PENDING',
    logo: '',
    banner: '',
    email: '',
    phone: '',
    website: '',
    businessName: '',
    businessAddress: '',
    taxCode: '',
    businessLicense: '',
    address: '',
    returnPolicy: '',
    shippingPolicy: '',
    warrantyPolicy: '',
    isActive: false,
    isFeatured: false,
    isVerified: false,
    isOfficialStore: false,
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
}

const EditStorePage = () => {
    const params = useParams()
    const id = params.id as string
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Form
    const [formData, setFormData] = useState<Partial<StoreData>>(initialFormData)

    // Fetch store data
    const fetchStore = async () => {
        try {
            const response = await api.get(`/admin/stores/${id}`)
            setFormData(response.data)
        } catch (error) {
            console.error('Error fetching store:', error)
            router.push('/admin/stores')
        }
    }

    useEffect(() => {
        fetchStore()
    }, [id])

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            await api.put(`/admin/stores/${id}`, formData)
            toast.success('Cập nhật cửa hàng thành công')
            router.push(`/admin/stores/${id}`)
        } catch (error) {
            console.error('Error updating store:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Chỉnh sửa cửa hàng</CardTitle>
                    <CardDescription>
                        Chỉnh sửa thông tin cửa hàng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Tên cửa hàng *
                                    </label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nhập tên cửa hàng"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="type" className="text-sm font-medium">
                                        Loại hình *
                                    </label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: StoreType) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại hình" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INDIVIDUAL">Cá nhân</SelectItem>
                                            <SelectItem value="BUSINESS">Doanh nghiệp</SelectItem>
                                            <SelectItem value="CORPORATION">Tập đoàn</SelectItem>
                                            <SelectItem value="OFFICIAL">Chính thức</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium">
                                        Trạng thái *
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: StoreStatus) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                            <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                                            <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
                                            <SelectItem value="CLOSED">Đã đóng</SelectItem>

                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="verificationStatus" className="text-sm font-medium">
                                        Trạng thái xác thực *
                                    </label>
                                    <Select
                                        value={formData.verificationStatus}
                                        onValueChange={(value: VerificationStatus) => setFormData({ ...formData, verificationStatus: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái xác thực" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                                            <SelectItem value="VERIFIED">Đã xác thực</SelectItem>
                                            <SelectItem value="REJECTED">Từ chối</SelectItem>
                                            <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin liên hệ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Nhập email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium">
                                        Điện thoại
                                    </label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="website" className="text-sm font-medium">
                                        Website
                                    </label>
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="Nhập website"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thông tin doanh nghiệp</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="businessName" className="text-sm font-medium">
                                        Tên doanh nghiệp
                                    </label>
                                    <Input
                                        id="businessName"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        placeholder="Nhập tên doanh nghiệp"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="businessAddress" className="text-sm font-medium">
                                        Địa chỉ doanh nghiệp
                                    </label>
                                    <Input
                                        id="businessAddress"
                                        value={formData.businessAddress}
                                        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                                        placeholder="Nhập địa chỉ doanh nghiệp"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="taxCode" className="text-sm font-medium">
                                        Mã số thuế
                                    </label>
                                    <Input
                                        id="taxCode"
                                        value={formData.taxCode}
                                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                        placeholder="Nhập mã số thuế"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="businessLicense" className="text-sm font-medium">
                                        Giấy phép kinh doanh
                                    </label>
                                    <Input
                                        id="businessLicense"
                                        value={formData.businessLicense}
                                        onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                                        placeholder="Nhập số giấy phép kinh doanh"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Địa chỉ</h3>

                        </div>

                        {/* Policies */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Chính sách cửa hàng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="returnPolicy" className="text-sm font-medium">
                                        Chính sách đổi trả
                                    </label>
                                    <Textarea
                                        id="returnPolicy"
                                        value={formData.returnPolicy}
                                        onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                                        placeholder="Nhập chính sách đổi trả"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="shippingPolicy" className="text-sm font-medium">
                                        Chính sách vận chuyển
                                    </label>
                                    <Textarea
                                        id="shippingPolicy"
                                        value={formData.shippingPolicy}
                                        onChange={(e) => setFormData({ ...formData, shippingPolicy: e.target.value })}
                                        placeholder="Nhập chính sách vận chuyển"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="warrantyPolicy" className="text-sm font-medium">
                                        Chính sách bảo hành
                                    </label>
                                    <Textarea
                                        id="warrantyPolicy"
                                        value={formData.warrantyPolicy}
                                        onChange={(e) => setFormData({ ...formData, warrantyPolicy: e.target.value })}
                                        placeholder="Nhập chính sách bảo hành"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Store Features */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Tính năng cửa hàng</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isVerified"
                                        checked={formData.isVerified}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                                    />
                                    <label htmlFor="isVerified" className="text-sm font-medium">
                                        Đã xác thực
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isOfficialStore"
                                        checked={formData.isOfficialStore}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isOfficialStore: checked })}
                                    />
                                    <label htmlFor="isOfficialStore" className="text-sm font-medium">
                                        Cửa hàng chính hãng
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                                    />
                                    <label htmlFor="isFeatured" className="text-sm font-medium">
                                        Nổi bật
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isVerified"
                                        checked={formData.isVerified}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                                    />
                                    <label htmlFor="isVerified" className="text-sm font-medium">
                                        Xác thực
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isOfficialStore"
                                        checked={formData.isOfficialStore}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isOfficialStore: checked })}
                                    />
                                    <label htmlFor="isOfficialStore" className="text-sm font-medium">
                                        Cửa hàng chính thức
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Mạng xã hội</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="facebookUrl" className="text-sm font-medium">
                                        Facebook
                                    </label>
                                    <Input
                                        id="facebookUrl"
                                        value={formData.facebookUrl}
                                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                                        placeholder="Nhập URL Facebook"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="instagramUrl" className="text-sm font-medium">
                                        Instagram
                                    </label>
                                    <Input
                                        id="instagramUrl"
                                        value={formData.instagramUrl}
                                        onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                                        placeholder="Nhập URL Instagram"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="youtubeUrl" className="text-sm font-medium">
                                        Youtube
                                    </label>
                                    <Input
                                        id="youtubeUrl"
                                        value={formData.youtubeUrl}
                                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                        placeholder="Nhập URL Youtube"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Store Images */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Hình ảnh cửa hàng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Logo</label>
                                    <CloudinaryUpload
                                        value={formData.logo}
                                        onChange={(url) => setFormData({ ...formData, logo: url })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Banner</label>
                                    <CloudinaryUpload
                                        value={formData.banner}
                                        onChange={(url) => setFormData({ ...formData, banner: url })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditStorePage 