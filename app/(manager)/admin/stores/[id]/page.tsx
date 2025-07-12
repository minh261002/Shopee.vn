"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash2, Store, Phone, Globe, MapPin, Building2, FileText, BarChart3, Star, Users, ShoppingBag, DollarSign, ImageIcon, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/axios'
import type { StoreData } from '@/types/store'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const StoreDetailPage = () => {
    const params = useParams()
    const id = params.id as string
    const [store, setStore] = useState<StoreData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Fetch store data
    const fetchStore = async () => {
        try {
            const response = await api.get(`/admin/stores/${id}`)
            setStore(response.data)
        } catch (error) {
            console.error('Error fetching store:', error)
            router.push('/admin/stores')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStore()
    }, [id])

    // Handle delete
    const handleDelete = async () => {
        if (!store) return

        try {
            await api.delete(`/admin/stores/${store.id}`)
            toast.success('Xóa cửa hàng thành công')
            router.push('/admin/stores')
        } catch (error) {
            console.error('Error deleting store:', error)
        }
    }

    // Handle edit
    const handleEdit = () => {
        router.push(`/admin/stores/${id}/edit`)
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

    if (!store) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Không tìm thấy cửa hàng</p>
                </div>
            </div>
        )
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
                <div className="flex items-center gap-2">
                    <Button onClick={handleEdit} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa cửa hàng</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa cửa hàng &quot;{store.name}&quot;?
                                    Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Xóa cửa hàng
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Store Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Tên cửa hàng</p>
                            <p className="text-lg">{store.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Loại hình</p>
                            <Badge>{store.type}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Trạng thái</p>
                            <Badge
                                variant={
                                    store.status === 'ACTIVE' ? 'default' :
                                        store.status === 'PENDING_APPROVAL' ? 'secondary' :
                                            store.status === 'SUSPENDED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {store.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Xác thực</p>
                            <Badge
                                variant={
                                    store.verificationStatus === 'VERIFIED' ? 'default' :
                                        store.verificationStatus === 'PENDING' ? 'secondary' :
                                            store.verificationStatus === 'REJECTED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {store.verificationStatus}
                            </Badge>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Thông tin liên hệ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Phone className="w-4 h-4" /> Điện thoại
                                </p>
                                <p>{store.phone || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Website
                                </p>
                                <p>{store.website || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Email
                                </p>
                                <p>{store.email || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Địa chỉ
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <p className="text-sm font-medium">Địa chỉ chi tiết</p>
                            <p>{store.address}</p>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Thông tin doanh nghiệp
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Tên doanh nghiệp</p>
                                <p>{store.businessName || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Địa chỉ doanh nghiệp</p>
                                <p>{store.businessAddress || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Mã số thuế</p>
                                <p>{store.taxCode || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Giấy phép kinh doanh</p>
                                <p>{store.businessLicense || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Chính sách cửa hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Chính sách đổi trả</p>
                                <p className="whitespace-pre-wrap">{store.returnPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách vận chuyển</p>
                                <p className="whitespace-pre-wrap">{store.shippingPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách bảo hành</p>
                                <p className="whitespace-pre-wrap">{store.warrantyPolicy || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Thống kê
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <Star className="w-4 h-4" />
                                    Đánh giá
                                </p>
                                <p className="text-xl font-semibold">{store.rating.toFixed(1)}/5</p>
                                <p className="text-sm text-muted-foreground">({store.reviewCount} đánh giá)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <Users className="w-4 h-4" />
                                    Người theo dõi
                                </p>
                                <p className="text-xl font-semibold">{store.followerCount}</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Sản phẩm & Đơn hàng
                                </p>
                                <p className="text-xl font-semibold">{store.totalProducts}</p>
                                <p className="text-sm text-muted-foreground">({store.totalOrders} đơn)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    Doanh thu
                                </p>
                                <p className="text-xl font-semibold">{store.totalRevenue.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                    </div>

                    {/* Store Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Hình ảnh cửa hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-2">Logo</p>
                                {store.logo ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                        <Image
                                            src={store.logo}
                                            alt="Store logo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-secondary/10 rounded-lg flex items-center justify-center">
                                        <Store className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Banner</p>
                                {store.banner ? (
                                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                        <Image
                                            src={store.banner}
                                            alt="Store banner"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-40 bg-secondary/10 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Status */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Trạng thái hoạt động
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium">Hoạt động</p>
                                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                                    {store.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Nổi bật</p>
                                <Badge variant={store.isFeatured ? 'default' : 'secondary'}>
                                    {store.isFeatured ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Xác thực</p>
                                <Badge variant={store.isVerified ? 'default' : 'secondary'}>
                                    {store.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cửa hàng chính thức</p>
                                <Badge variant={store.isOfficialStore ? 'default' : 'secondary'}>
                                    {store.isOfficialStore ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Mạng xã hội
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium">Facebook</p>
                                {store.facebookUrl ? (
                                    <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.facebookUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Instagram</p>
                                {store.instagramUrl ? (
                                    <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.instagramUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Youtube</p>
                                {store.youtubeUrl ? (
                                    <a href={store.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.youtubeUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Timestamps */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Thời gian
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Ngày tạo</p>
                                <p>{format(new Date(store.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cập nhật lần cuối</p>
                                <p>{format(new Date(store.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default StoreDetailPage 